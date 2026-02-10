"""
推荐系统：使用现有的 Firebase lessons
直接推荐已存在的课程，不创建新的
"""

from dotenv import load_dotenv
import os
import pandas as pd
from firebase_admin import initialize_app, firestore, credentials
from SOLUTION_1_ContentBased import ContentBasedRecommender

# ========================================
# 初始化 Firebase
# ========================================

def init_firebase():
    """从 .env.backend 初始化 Firebase"""
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
    print("✅ Firebase initialized\n")
    return firestore.client()


# ========================================
# 读取现有的 lessons（真实课程）
# ========================================

def fetch_all_content(db):
    """从 Firebase 读取所有现有的学习内容"""
    content_list = []
    
    print("📚 Fetching existing content from Firebase...")
    
    # 1. 读取 Lessons（你现有的课程）
    print("  📖 Fetching lessons from lessonContent...")
    lessons = db.collection('lessonContent').stream()
    lesson_count = 0
    for doc in lessons:
        data = doc.to_dict()
        introduction = data.get('introduction', {})
        
        content_list.append({
            'id': doc.id,  # 使用真实的 lesson ID
            'title': introduction.get('title', 'Untitled'),
            'category': (data.get('moduleId', 'general')).capitalize(),
            'level': (data.get('level', 'A1')).upper(),
            'description': introduction.get('summary', ''),
            'type': 'lesson',
            'route': f"/modules/{data.get('moduleId', 'general')}/lesson/{doc.id}"  # 真实路由
        })
        lesson_count += 1
    
    # 2. 读取 Videos（如果有）
    print("  🎥 Fetching videos...")
    videos = db.collection('videos').stream()
    video_count = 0
    for doc in videos:
        data = doc.to_dict()
        content_list.append({
            'id': doc.id,  # 使用真实的 video ID
            'title': data.get('title', 'Untitled'),
            'category': (data.get('category', 'general')).capitalize(),
            'level': (data.get('level', 'A1')).upper(),
            'description': data.get('description', ''),
            'type': 'video',
            'route': f"/modules/{data.get('category', 'general')}/video/{doc.id}"  # 真实路由
        })
        video_count += 1
    
    # 3. 读取 Admin Content（如果有）
    print("  📄 Fetching admin content...")
    admin = db.collection('adminContent').stream()
    admin_count = 0
    for doc in admin:
        data = doc.to_dict()
        if data.get('status') == 'published':
            content_list.append({
                'id': doc.id,
                'title': data.get('title', 'Untitled'),
                'category': (data.get('category', 'general')).capitalize(),
                'level': (data.get('level', 'A1')).upper(),
                'description': data.get('description', ''),
                'type': data.get('type', 'lesson'),
                'route': f"/modules/{data.get('category', 'general')}/content/{doc.id}"
            })
            admin_count += 1
    
    df = pd.DataFrame(content_list)
    
    print(f"✅ Loaded {len(df)} items:")
    print(f"   - {lesson_count} lessons")
    print(f"   - {video_count} videos")
    print(f"   - {admin_count} admin content")
    print()
    
    return df


# ========================================
# 训练推荐模型
# ========================================

def train_recommender(content_df):
    """训练推荐模型"""
    print("🔧 Training recommendation model...")
    recommender = ContentBasedRecommender()
    recommender.fit(content_df)
    print()
    return recommender


# ========================================
# 为单个用户生成推荐
# ========================================

def generate_recommendations_for_user(db, recommender, content_df, user_id, user_data, progress_data):
    """为单个用户生成推荐"""
    
    # 获取用户信息
    user_level = user_data.get('quizLevel', 'A1')
    learning_goals = user_data.get('learningGoals', [])
    completed_lessons = progress_data.get('completedLessons', [])
    
    # 生成推荐（取 10 个）
    recommendations = recommender.recommend(
        user_level=user_level,
        learning_goals=learning_goals,
        completed_lessons=completed_lessons,
        n=10
    )
    
    # 转换为列表，包含真实的路由
    recs_list = []
    for _, row in recommendations.iterrows():
        # 从 content_df 获取完整信息（包括 route）
        content_info = content_df[content_df['id'] == row['id']].iloc[0]
        
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
    
    # 写入 recommendations collection
    db.collection('recommendations').document(user_id).set(recommendation_data)
    
    return len(recs_list)


# ========================================
# 为所有用户生成推荐
# ========================================

def generate_recommendations_for_all_users(db, recommender, content_df):
    """为所有用户生成推荐"""
    
    print("🎯 Generating recommendations for all users...")
    print("="*60 + "\n")
    
    # 获取所有用户
    users = db.collection('users').stream()
    
    total_users = 0
    success_count = 0
    
    for user_doc in users:
        total_users += 1
        user_id = user_doc.id
        user_data = user_doc.to_dict()
        
        # 获取用户进度
        progress_doc = db.collection('userProgress').document(user_id).get()
        progress_data = progress_doc.to_dict() if progress_doc.exists else {}
        
        try:
            # 生成推荐
            num_recs = generate_recommendations_for_user(
                db, recommender, content_df, user_id, user_data, progress_data
            )
            
            success_count += 1
            print(f"✅ User {user_id[:8]}... → {num_recs} recommendations")
            
        except Exception as e:
            print(f"❌ User {user_id[:8]}... → Error: {e}")
    
    print("\n" + "="*60)
    print(f"📊 Summary:")
    print(f"   Total users: {total_users}")
    print(f"   Success: {success_count}")
    print(f"   Failed: {total_users - success_count}")
    print("="*60)


# ========================================
# 为特定用户生成推荐（单个）
# ========================================

def generate_for_specific_user(db, recommender, content_df, user_id):
    """为特定用户生成推荐"""
    
    print(f"🎯 Generating recommendations for user: {user_id}\n")
    
    # 获取用户数据
    user_doc = db.collection('users').document(user_id).get()
    
    if not user_doc.exists:
        print(f"❌ User {user_id} not found")
        return
    
    user_data = user_doc.to_dict()
    
    # 获取用户进度
    progress_doc = db.collection('userProgress').document(user_id).get()
    progress_data = progress_doc.to_dict() if progress_doc.exists else {}
    
    # 生成推荐
    num_recs = generate_recommendations_for_user(
        db, recommender, content_df, user_id, user_data, progress_data
    )
    
    print(f"\n✅ Generated {num_recs} recommendations for {user_id}")
    print(f"   Level: {user_data.get('quizLevel', 'N/A')}")
    print(f"   Goals: {', '.join(user_data.get('learningGoals', []))}")


# ========================================
# Main
# ========================================

def main():
    """主函数"""
    
    print("="*60)
    print("🚀 Recommendation System - Using Existing Lessons")
    print("="*60 + "\n")
    
    try:
        # 1. 初始化 Firebase
        db = init_firebase()
        
        # 2. 读取现有内容
        content_df = fetch_all_content(db)
        
        if content_df.empty:
            print("❌ No content found in Firebase")
            print("💡 Please add lessons to lessonContent collection first")
            return
        
        # 3. 训练模型
        recommender = train_recommender(content_df)
        
        # 4. 选择模式
        print("选择模式：")
        print("1. 为所有用户生成推荐")
        print("2. 为特定用户生成推荐")
        print()
        
        choice = input("请输入 1 或 2 (默认 1): ").strip() or "1"
        
        if choice == "1":
            # 为所有用户生成
            generate_recommendations_for_all_users(db, recommender, content_df)
        
        elif choice == "2":
            # 为特定用户生成
            user_id = input("请输入用户 ID: ").strip()
            if user_id:
                generate_for_specific_user(db, recommender, content_df, user_id)
            else:
                print("❌ 用户 ID 不能为空")
        
        else:
            print("❌ 无效的选择")
        
        print("\n✅ 完成！")
        print("💡 推荐已保存到 Firebase 的 'recommendations' collection")
        print("💡 推荐的课程都是 lessonContent 中现有的课程")
        print("💡 用户点击可以直接跳转到真实课程")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()