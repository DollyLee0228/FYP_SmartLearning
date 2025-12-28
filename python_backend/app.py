# app.py - Simplified Backend: Just compare text from browser

from flask import Flask, request, jsonify
from flask_cors import CORS
from difflib import SequenceMatcher
import os
import tempfile

app = Flask(__name__)
CORS(app)

def calculate_similarity(text1, text2):
    """Calculate similarity between two texts"""
    text1 = text1.lower().strip()
    text2 = text2.lower().strip()
    similarity = SequenceMatcher(None, text1, text2).ratio()
    return similarity

def get_pronunciation_score(user_text, target_text):
    """Calculate pronunciation score based on similarity"""
    similarity = calculate_similarity(user_text, target_text)
    score = int(similarity * 100)
    
    if score >= 90:
        level = "excellent"
        feedback = "Excellent pronunciation! Very clear and accurate."
    elif score >= 80:
        level = "good"
        feedback = "Good job! Your pronunciation is clear and understandable."
    elif score >= 70:
        level = "fair"
        feedback = "Fair attempt. Try to pronounce each word more clearly."
    elif score >= 60:
        level = "needs-improvement"
        feedback = "Needs improvement. Focus on clarity and correct pronunciation."
    else:
        level = "poor"
        feedback = "Keep practicing! Listen to the model sentence again and try to match it."
    
    return score, level, feedback

def get_specific_feedback(user_text, target_text):
    """Get specific feedback on what was different"""
    user_words = user_text.lower().split()
    target_words = target_text.lower().split()
    
    missing_words = []
    extra_words = []
    
    for word in target_words:
        if word not in user_words:
            missing_words.append(word)
    
    for word in user_words:
        if word not in target_words:
            extra_words.append(word)
    
    specific_feedback = []
    
    if missing_words:
        specific_feedback.append(f"Missing words: {', '.join(missing_words[:5])}")
    
    if extra_words:
        specific_feedback.append(f"Extra words: {', '.join(extra_words[:5])}")
    
    if not missing_words and not extra_words:
        specific_feedback.append("Word choice is accurate!")
    
    # Additional feedback based on score
    similarity = calculate_similarity(user_text, target_text)
    if similarity < 0.5:
        specific_feedback.append("Try to speak more of the sentence next time.")
    elif similarity >= 0.9:
        specific_feedback.append("Great job! Your pronunciation was very accurate.")
    
    return specific_feedback

@app.route('/api/score-pronunciation', methods=['POST'])
def score_pronunciation():
    """
    API endpoint to score pronunciation
    """
    temp_audio_path = None  # ✅ 添加这个
    
    try:
        target_text = request.form.get('target_text', '')
        user_text = request.form.get('user_text', '')
        
        if not target_text:
            return jsonify({'error': 'No target text provided'}), 400
        
        if not user_text:
            return jsonify({'error': 'No recognized text provided'}), 400
        
        # Optional: Save audio file if provided
        if 'audio' in request.files:
            audio_file = request.files['audio']
            
            # ✅ 修改这部分：不立即删除，延迟删除
            with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_audio:
                audio_file.save(temp_audio.name)
                temp_audio_path = temp_audio.name
                audio_size = os.path.getsize(temp_audio_path)
                print(f"📁 Audio saved: {audio_size} bytes")
        
        print(f"🎯 Target: {target_text}")
        print(f"🗣️  User said: {user_text}")
        
        # Calculate score
        score, level, feedback = get_pronunciation_score(user_text, target_text)
        specific_feedback = get_specific_feedback(user_text, target_text)
        similarity = calculate_similarity(user_text, target_text)
        
        print(f"📊 Score: {score}/100 ({level})")
        
        return jsonify({
            'success': True,
            'user_text': user_text,
            'target_text': target_text,
            'score': score,
            'level': level,
            'feedback': feedback,
            'specific_feedback': specific_feedback,
            'similarity': similarity,
        }), 200
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500
    
    finally:
        # ✅ 添加延迟删除
        if temp_audio_path and os.path.exists(temp_audio_path):
            try:
                import time
                time.sleep(0.1)  # 等待100毫秒
                os.remove(temp_audio_path)
                print("🗑️  Temp file cleaned up")
            except Exception as e:
                print(f"⚠️  Could not delete temp file: {e}")
                # 不要让这个错误影响响应
                pass

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Speech pronunciation API is running',
        'mode': 'text_comparison',
        'features': {
            'audio_upload': True,
            'text_comparison': True,
            'scoring': True,
            'speech_recognition': 'browser_based'
        },
        'note': 'Using browser Web Speech API for recognition, Python for scoring'
    }), 200

if __name__ == '__main__':
    print("=" * 70)
    print("🎤 Speech Pronunciation Scoring API")
    print("=" * 70)
    print()
    print("📍 API: http://localhost:5000")
    print()
    print("✨ MODE: Text Comparison (Browser Speech Recognition)")
    print()
    print("🔧 How it works:")
    print("   1. Browser records audio")
    print("   2. Browser recognizes speech (Web Speech API)")
    print("   3. Browser sends recognized text to Python")
    print("   4. Python compares text and calculates score")
    print("   5. Python returns score and feedback")
    print()
    print("✅ Features:")
    print("   • Real speech recognition (from browser)")
    print("   • Accurate text comparison")
    print("   • Smart scoring algorithm")
    print("   • Detailed feedback")
    print()
    print("💡 Benefits:")
    print("   • No Google API key needed")
    print("   • Works with Python 3.14")
    print("   • Free and simple")
    print("   • Real-time transcription")
    print()
    print("⚠️  Requirements:")
    print("   • Use Chrome, Edge, or Safari")
    print("   • Allow microphone access")
    print("   • Internet connection (for Web Speech API)")
    print()
    print("=" * 70)
    print()
    
    app.run(debug=True, host='0.0.0.0', port=5000)