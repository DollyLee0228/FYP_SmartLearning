"""
推荐 API 服务器 - 自动生成推荐
前端完成 quiz 或更改 goals 后调用这个 API
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import pandas as pd
from firebase_admin import initialize_app, firestore, credentials
from SOLUTION_1_ContentBased import ContentBasedRecommender

app = Flask(__name__)
CORS(app)  # 允许前端调用

# 全局变量：缓存内容和模型
_content_df = None
_recommender = None
_last_updated = None

# ========================================
# 初始化 Firebase
# ========================================

def init_firebase():
    """初始化 Firebase（只运行一次）"""
    load_dotenv('.env.backend')
    
    firebase_config = {
        "type": "service_account",
        "project_id": os.getenv("FIREBASE_PROJECT_ID"),
        "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
        "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace('\\n', '\n'),
        "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
        "client_id": os.getenv("FIREBASE_CLIENT_ID"),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    }
    
    cred = credentials.Certificate(firebase_config)
    initialize_app(cred)
    print("✅ Firebase initialized")
    return firestore.client()


# ========================================
# 加载内容和训练模型
# ========================================

def load_content_and_train(db):
    """加载内容并训练推荐模型"""
    global _content_df, _recommender, _last_updated
    
    print("🔄 Loading content and training model...")
    
    content_list = []
    
    # 读取 Lessons
    lessons = db.collection('lessonContent').stream()
    for doc in lessons:
        data = doc.to_dict()
        introduction = data.get('introduction', {})
        content_list.append({
            'id': doc.id,
            'title': introduction.get('title', 'Untitled'),
            'category': (data.get('moduleId', 'general')).capitalize(),
            'level': (data.get('level', 'A1')).upper(),
            'description': introduction.get('summary', ''),
            'type': 'lesson',
            'route': f"/modules/{data.get('moduleId', 'general')}/lesson/{doc.id}"
        })
    
    # 读取 Videos
    videos = db.collection('videos').stream()
    for doc in videos:
        data = doc.to_dict()
        content_list.append({
            'id': doc.id,
            'title': data.get('title', 'Untitled'),
            'category': (data.get('category', 'general')).capitalize(),
            'level': (data.get('level', 'A1')).upper(),
            'description': data.get('description', ''),
            'type': 'video',
            'route': f"/modules/{data.get('category', 'general')}/video/{doc.id}"
        })
    
    _content_df = pd.DataFrame(content_list)
    
    # 训练模型
    _recommender = ContentBasedRecommender()
    _recommender.fit(_content_df)
    _last_updated = pd.Timestamp.now()
    
    print(f"✅ Loaded {len(_content_df)} items and trained model")


# ========================================
# API: 生成推荐
# ========================================

@app.route('/api/generate-recommendations', methods=['POST'])
def generate_recommendations():
    """
    为指定用户生成推荐
    
    Request:
    {
        "userId": "abc123"
    }
    
    Response:
    {
        "success": true,
        "recommendations": 10,
        "message": "Recommendations generated successfully"
    }
    """
    try:
        data = request.json
        user_id = data.get('userId')
        
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'userId is required'
            }), 400
        
        print(f"\n🎯 Generating recommendations for user: {user_id}")
        
        # 获取 Firestore 客户端
        db = firestore.client()
        
        # 获取用户数据
        user_doc = db.collection('users').document(user_id).get()
        if not user_doc.exists:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        user_data = user_doc.to_dict()
        user_level = user_data.get('quizLevel', 'A1')
        learning_goals = user_data.get('learningGoals', [])
        
        # 获取用户进度
        progress_doc = db.collection('userProgress').document(user_id).get()
        completed_lessons = []
        if progress_doc.exists:
            progress_data = progress_doc.to_dict()
            completed_lessons = progress_data.get('completedLessons', [])
        
        # 生成推荐
        recommendations = _recommender.recommend(
            user_level=user_level,
            learning_goals=learning_goals,
            completed_lessons=completed_lessons,
            n=10
        )
        
        # 转换为列表
        recs_list = []
        for _, row in recommendations.iterrows():
            content_info = _content_df[_content_df['id'] == row['id']].iloc[0]
            
            recs_list.append({
                'id': row['id'],
                'title': row['title'],
                'category': row['category'],
                'level': row['level'],
                'score': float(row['score']),
                'description': content_info.get('description', ''),
                'type': content_info.get('type', 'lesson'),
                'route': content_info.get('route', f"/modules/{row['category'].lower()}/lesson/{row['id']}")
            })
        
        # 保存到 Firebase
        recommendation_data = {
            'userId': user_id,
            'recommendations': recs_list,
            'userLevel': user_level,
            'learningGoals': learning_goals,
            'generatedAt': firestore.SERVER_TIMESTAMP,
            'totalRecommendations': len(recs_list)
        }
        
        db.collection('recommendations').document(user_id).set(recommendation_data)
        
        print(f"✅ Generated {len(recs_list)} recommendations for {user_id}")
        
        return jsonify({
            'success': True,
            'recommendations': len(recs_list),
            'message': 'Recommendations generated successfully'
        })
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ========================================
# API: 重新加载内容
# ========================================

@app.route('/api/reload-content', methods=['POST'])
def reload_content():
    """
    重新加载内容和训练模型
    当添加新课程时调用
    """
    try:
        db = firestore.client()
        load_content_and_train(db)
        
        return jsonify({
            'success': True,
            'message': 'Content reloaded and model retrained',
            'totalItems': len(_content_df)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ========================================
# API: 健康检查
# ========================================

@app.route('/api/health', methods=['GET'])
def health():
    """健康检查"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': _recommender is not None,
        'total_content': len(_content_df) if _content_df is not None else 0,
        'last_updated': _last_updated.isoformat() if _last_updated else None
    })


# ========================================
# 启动服务器
# ========================================

if __name__ == '__main__':
    print("="*60)
    print("🚀 Starting Auto-Recommendation API Server")
    print("="*60)
    
    # 初始化 Firebase
    db = init_firebase()
    
    # 加载内容和训练模型
    load_content_and_train(db)
    
    print("\n" + "="*60)
    print("📍 API Endpoints:")
    print("   POST /api/generate-recommendations  - Generate Recommendation")
    print("   POST /api/reload-content            - Reload Content")
    print("   GET  /api/health                    - Health Check")
    print("="*60)
    print("✅ Server ready! Listening on http://localhost:8080")
    print("="*60)
    print()
    
    # 启动服务器
    app.run(debug=True, port=5000, host='0.0.0.0')