"""
Combined API Server
Includes:
1. Speaking features (original)
2. Recommendation features (new)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import pandas as pd
from firebase_admin import initialize_app, firestore, credentials
from SOLUTION_1_ContentBased import ContentBasedRecommender

app = Flask(__name__)
CORS(app)

# Global variables for recommendation system
_content_df = None
_recommender = None
_last_updated = None

# ========================================
# Initialize Firebase
# ========================================

def init_firebase():
    """Initialize Firebase (runs once)"""
    try:
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
    except Exception as e:
        print(f"⚠️  Firebase initialization skipped (probably already initialized): {e}")
        return firestore.client()


# ========================================
# Load content and train model
# ========================================

def load_content_and_train(db):
    """Load content and train recommendation model"""
    global _content_df, _recommender, _last_updated
    
    print("🔄 Loading content and training recommendation model...")
    
    content_list = []
    
    # Read Lessons from lessonContent
    print("  📖 Reading lessons from lessonContent...")
    lessons = db.collection('lessonContent').stream()
    
    for doc in lessons:
        data = doc.to_dict()
        lesson_id = doc.id
        
        # Get title - try multiple sources
        title = None
        if 'title' in data and data['title']:
            title = data['title']
        elif 'introduction' in data and isinstance(data['introduction'], dict):
            intro = data['introduction']
            if 'title' in intro and intro['title']:
                title = intro['title']
        
        # If still no title, use lesson ID
        if not title:
            title = f"Lesson {lesson_id}"
        
        # Get description
        description = ""
        if 'introduction' in data and isinstance(data['introduction'], dict):
            intro = data['introduction']
            description = intro.get('summary') or intro.get('description') or ""
        if not description and 'description' in data:
            description = data['description']
        if not description and 'summary' in data:
            description = data['summary']
        if not description:
            description = f"Learn {title.lower()}"
        
        # Get module ID
        module_id = data.get('moduleId', 'general')
        
        # Get level
        level = (data.get('level', 'A1')).upper()
        
        # Create correct route: /lesson/{moduleId}/{lessonId}
        route = f"/lesson/{module_id}/{lesson_id}"
        
        content_list.append({
            'id': lesson_id,
            'title': title,
            'category': module_id.capitalize(),
            'level': level,
            'description': description,
            'type': 'lesson',
            'route': route
        })
        
        print(f"    ✅ {title} → {route}")
    
    # Read Videos
    print("  🎥 Reading videos...")
    videos = db.collection('videos').stream()
    
    for doc in videos:
        data = doc.to_dict()
        video_id = doc.id
        
        title = data.get('title', f"Video {video_id}")
        category = data.get('category', 'general')
        level = (data.get('level', 'A1')).upper()
        description = data.get('description', f"Watch {title.lower()}")
        
        # Create route for videos
        route = f"/videos/{video_id}"
        
        content_list.append({
            'id': video_id,
            'title': title,
            'category': category.capitalize(),
            'level': level,
            'description': description,
            'type': 'video',
            'route': route
        })
        
        print(f"    ✅ {title} → {route}")
    
    if not content_list:
        print("⚠️  No content found!")
        return
    
    _content_df = pd.DataFrame(content_list)
    
    # Train model
    print("\n🔧 Training recommendation model...")
    _recommender = ContentBasedRecommender()
    _recommender.fit(_content_df)
    _last_updated = pd.Timestamp.now()
    
    print(f"✅ Loaded {len(_content_df)} items and trained model\n")


# ========================================
# API: Generate recommendations
# ========================================

@app.route('/api/generate-recommendations', methods=['POST'])
def generate_recommendations():
    """
    Generate recommendations for a specific user
    
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
        
        db = firestore.client()
        
        # Get user data
        user_doc = db.collection('users').document(user_id).get()
        if not user_doc.exists:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        user_data = user_doc.to_dict()
        user_level = user_data.get('quizLevel', 'A1')
        learning_goals = user_data.get('learningGoals', [])
        
        # Get user progress
        progress_doc = db.collection('userProgress').document(user_id).get()
        completed_lessons = []
        if progress_doc.exists:
            progress_data = progress_doc.to_dict()
            completed_lessons = progress_data.get('completedLessons', [])
        
        # Generate recommendations
        recommendations = _recommender.recommend(
            user_level=user_level,
            learning_goals=learning_goals,
            completed_lessons=completed_lessons,
            n=10
        )
        
        # Convert to list with full details from content_df
        recs_list = []
        for _, row in recommendations.iterrows():
            # Get full content info including correct route
            content_info = _content_df[_content_df['id'] == row['id']].iloc[0]
            
            recs_list.append({
                'id': row['id'],
                'title': content_info['title'],  # Use actual title from Firebase
                'category': row['category'],
                'level': row['level'],
                'score': float(row['score']),
                'description': content_info['description'],
                'type': content_info['type'],
                'route': content_info['route']  # Use correct route from content_df
            })
            
            print(f"  ✅ {content_info['title']} (score: {row['score']:.2f})")
        
        # Save to Firebase
        recommendation_data = {
            'userId': user_id,
            'recommendations': recs_list,
            'userLevel': user_level,
            'learningGoals': learning_goals,
            'generatedAt': firestore.SERVER_TIMESTAMP,
            'totalRecommendations': len(recs_list)
        }
        
        db.collection('recommendations').document(user_id).set(recommendation_data)
        
        print(f"✅ Generated {len(recs_list)} recommendations for {user_id}\n")
        
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
# API: Reload content
# ========================================

@app.route('/api/reload-content', methods=['POST'])
def reload_content():
    """
    Reload content and retrain model
    Call this when you add new lessons
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
# API: Health check
# ========================================

@app.route('/api/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({
        'status': 'healthy',
        'recommendation_model_loaded': _recommender is not None,
        'total_content': len(_content_df) if _content_df is not None else 0,
        'last_updated': _last_updated.isoformat() if _last_updated else None
    })


# ========================================
# Your original Speaking API goes here
# ========================================

# Copy your speaking-related routes from app.py here
# Example:
# @app.route('/api/speaking/analyze', methods=['POST'])
# def analyze_speaking():
#     # Your speaking code here
#     pass


# ========================================
# Start server
# ========================================

if __name__ == '__main__':
    print("="*60)
    print("🚀 Starting Combined API Server")
    print("   - Speaking API")
    print("   - Recommendation API")
    print("="*60)
    
    # Initialize Firebase
    try:
        db = init_firebase()
        
        # Load content and train recommendation model
        load_content_and_train(db)
    except Exception as e:
        print(f"⚠️  Warning: {e}")
        print("⚠️  Recommendation system may not work")
    
    print("="*60)
    print("📍 API Endpoints:")
    print("   POST /api/generate-recommendations  - Generate recommendations")
    print("   POST /api/reload-content            - Reload content")
    print("   GET  /api/health                    - Health check")
    print("   ...  (your speaking endpoints)")
    print("="*60)
    print("✅ Server ready! Listening on http://localhost:5000")
    print("="*60)
    print()
    
    # Start server
    app.run(debug=True, port=5000, host='0.0.0.0')