# app.py - Flask Backend for Speech Pronunciation Scoring

from flask import Flask, request, jsonify
from flask_cors import CORS
import speech_recognition as sr
from difflib import SequenceMatcher
import os
import tempfile
from pydub import AudioSegment
import io

app = Flask(__name__)
CORS(app)  # Allow React frontend to call this API

# Initialize speech recognizer
recognizer = sr.Recognizer()

def calculate_similarity(text1, text2):
    """Calculate similarity between two texts"""
    # Normalize texts
    text1 = text1.lower().strip()
    text2 = text2.lower().strip()
    
    # Calculate similarity ratio
    similarity = SequenceMatcher(None, text1, text2).ratio()
    return similarity

def get_pronunciation_score(user_text, target_text):
    """Calculate pronunciation score based on similarity"""
    similarity = calculate_similarity(user_text, target_text)
    score = int(similarity * 100)
    
    # Determine feedback level
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
        specific_feedback.append(f"Missing words: {', '.join(missing_words[:3])}")
    
    if extra_words:
        specific_feedback.append(f"Extra words detected: {', '.join(extra_words[:3])}")
    
    if not missing_words and not extra_words:
        specific_feedback.append("Word choice is accurate!")
    
    return specific_feedback

@app.route('/api/score-pronunciation', methods=['POST'])
def score_pronunciation():
    """
    API endpoint to score pronunciation
    
    Expected request:
    - audio file (webm, wav, mp3, etc.)
    - target_text (the model sentence to compare against)
    """
    
    try:
        # Check if audio file is present
        if 'audio' not in request.files:
            return jsonify({
                'error': 'No audio file provided'
            }), 400
        
        # Get audio file and target text
        audio_file = request.files['audio']
        target_text = request.form.get('target_text', '')
        
        if not target_text:
            return jsonify({
                'error': 'No target text provided'
            }), 400
        
        # Save audio to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_audio:
            audio_file.save(temp_audio.name)
            temp_audio_path = temp_audio.name
        
        # Convert to WAV if needed (speech_recognition works best with WAV)
        wav_path = temp_audio_path.replace('.webm', '.wav')
        
        try:
            # Convert audio to WAV format
            audio = AudioSegment.from_file(temp_audio_path)
            audio.export(wav_path, format='wav')
            
            # Recognize speech
            with sr.AudioFile(wav_path) as source:
                # Adjust for ambient noise
                recognizer.adjust_for_ambient_noise(source, duration=0.5)
                # Record audio
                audio_data = recognizer.record(source)
                
                # Try to recognize speech
                try:
                    user_text = recognizer.recognize_google(audio_data)
                    print(f"Recognized text: {user_text}")
                    
                except sr.UnknownValueError:
                    return jsonify({
                        'error': 'Could not understand audio. Please speak more clearly.',
                        'user_text': '',
                        'score': 0,
                        'level': 'poor',
                        'feedback': 'Audio was not clear enough. Please try recording again with clearer speech.'
                    }), 200
                
                except sr.RequestError as e:
                    return jsonify({
                        'error': f'Speech recognition service error: {str(e)}'
                    }), 500
            
            # Calculate score
            score, level, feedback = get_pronunciation_score(user_text, target_text)
            
            # Get specific feedback
            specific_feedback = get_specific_feedback(user_text, target_text)
            
            # Return results
            return jsonify({
                'success': True,
                'user_text': user_text,
                'target_text': target_text,
                'score': score,
                'level': level,
                'feedback': feedback,
                'specific_feedback': specific_feedback,
                'similarity': calculate_similarity(user_text, target_text)
            }), 200
            
        finally:
            # Clean up temporary files
            if os.path.exists(temp_audio_path):
                os.remove(temp_audio_path)
            if os.path.exists(wav_path):
                os.remove(wav_path)
    
    except Exception as e:
        return jsonify({
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Speech pronunciation API is running'
    }), 200

if __name__ == '__main__':
    print("🎤 Starting Speech Pronunciation Scoring API...")
    print("📍 API will be available at: http://localhost:5000")
    print("🔊 Make sure you have installed:")
    print("   - pip install flask flask-cors speechrecognition pydub")
    print("   - ffmpeg (for audio conversion)")
    app.run(debug=True, host='0.0.0.0', port=5000)