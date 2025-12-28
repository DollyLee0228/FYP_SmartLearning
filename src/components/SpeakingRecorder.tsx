import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Volume2, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface SpeakingPrompt {
  id: number;
  type: string;
  prompt: string;
  modelSentence: string;
  tips: string[];
  targetDuration: number;
}

interface SpeakingRecorderProps {
  prompt: SpeakingPrompt;
  onComplete: () => void;
  currentPromptIndex: number;
  totalPrompts: number;
}

export default function SpeakingRecorder({ 
  prompt, 
  onComplete, 
  currentPromptIndex, 
  totalPrompts 
}: SpeakingRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingModel, setIsPlayingModel] = useState(false);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isScoring, setIsScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState<any>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      stopModelSpeech();
    };
  }, []);

  // ✅ Play model sentence using TTS
  const playModelSentence = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(prompt.modelSentence);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsPlayingModel(true);
      utterance.onend = () => setIsPlayingModel(false);
      utterance.onerror = () => {
        setIsPlayingModel(false);
        toast.error('Text-to-speech failed');
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error('Text-to-speech not supported');
    }
  };

  const stopModelSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingModel(false);
    }
  };

  // ✅ Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast.success('Recording started');
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Could not access microphone. Please allow microphone permission.');
    }
  };

  // ✅ Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      toast.success('Recording stopped');
    }
  };

  // ✅ Play user's recording
  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => setIsPlayingRecording(true);
      audio.onended = () => setIsPlayingRecording(false);
      audio.onerror = () => {
        setIsPlayingRecording(false);
        toast.error('Could not play recording');
      };
      
      audio.play();
    }
  };

  const stopPlayingRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingRecording(false);
    }
  };

  // ✅ Re-record
  const reRecord = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setScoreResult(null);
    stopPlayingRecording();
  };

  // ✅ Score pronunciation (send to Python backend)
  const scorePronunciation = async () => {
    if (!audioBlob) {
      toast.error('Please record your voice first');
      return;
    }
    
    setIsScoring(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('target_text', prompt.modelSentence);
      
      const response = await fetch('http://localhost:5000/api/score-pronunciation', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        setScoreResult(result);
        toast.success(`Score: ${result.score}/100 - ${result.level}`);
      } else {
        toast.error(result.error || 'Failed to score pronunciation');
      }
      
    } catch (error) {
      console.error('Error scoring pronunciation:', error);
      toast.error('Could not connect to pronunciation API. Make sure Python backend is running.');
    } finally {
      setIsScoring(false);
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 80) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-[#0f1929] rounded-2xl p-8 max-w-3xl mx-auto">
      {/* Progress */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-gray-400">
          Speaking Prompt {currentPromptIndex + 1} of {totalPrompts}
        </span>
        <span className="text-blue-400 font-medium">Practice</span>
      </div>

      {/* Prompt Instructions */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">📝 Instructions</h2>
        <p className="text-gray-300 leading-relaxed">{prompt.prompt}</p>
      </div>

      {/* Tips */}
      <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <h3 className="text-blue-400 font-semibold mb-3">💡 Tips</h3>
        <ul className="space-y-2">
          {prompt.tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-blue-400 mt-1">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Target Duration */}
      <div className="mb-6 text-sm text-gray-400">
        🎯 Target duration: ~{prompt.targetDuration} seconds
      </div>

      {/* Model Sentence */}
      <div className="mb-6 bg-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-cyan-400 font-semibold">🔊 Model Sentence</h3>
          <Button
            onClick={isPlayingModel ? stopModelSpeech : playModelSentence}
            size="sm"
            className="bg-gradient-to-r from-cyan-500 to-blue-500"
          >
            {isPlayingModel ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 mr-2" />
                Play Model
              </>
            )}
          </Button>
        </div>
        <p className="text-gray-200 italic leading-relaxed">
          "{prompt.modelSentence}"
        </p>
      </div>

      {/* Recording Section */}
      <div className="mb-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-6">
        <h3 className="text-blue-400 font-semibold mb-4">🎤 Your Recording</h3>
        
        {/* Recording Controls */}
        <div className="flex items-center gap-4 mb-4">
          {!isRecording && !audioBlob && (
            <Button
              onClick={startRecording}
              size="lg"
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 flex-1"
            >
              <Mic className="w-5 h-5 mr-2" />
              Start Recording
            </Button>
          )}
          
          {isRecording && (
            <Button
              onClick={stopRecording}
              size="lg"
              className="bg-red-600 hover:bg-red-700 flex-1"
            >
              <Square className="w-5 h-5 mr-2" />
              Stop Recording
            </Button>
          )}
          
          {audioBlob && !isRecording && (
            <>
              <Button
                onClick={reRecord}
                size="lg"
                variant="outline"
                className="border-blue-500/30 text-blue-400"
              >
                🔁 Re-record
              </Button>
              
              <Button
                onClick={isPlayingRecording ? stopPlayingRecording : playRecording}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-indigo-500"
              >
                {isPlayingRecording ? (
                  <>
                    <Square className="w-5 h-5 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Play Recording
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Recording Time */}
        <div className="text-center">
          {isRecording && (
            <div className="text-red-400 font-mono text-2xl mb-2 animate-pulse">
              ⏺ {formatTime(recordingTime)}
            </div>
          )}
          
          {audioBlob && !isRecording && (
            <div className="text-blue-400 font-mono text-lg mb-2">
              Duration: {formatTime(recordingTime)}
            </div>
          )}
        </div>
      </div>

      {/* Score Button */}
      {audioBlob && !scoreResult && (
        <div className="mb-6">
          <Button
            onClick={scorePronunciation}
            disabled={isScoring}
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 w-full"
          >
            {isScoring ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Pronunciation...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Score My Pronunciation
              </>
            )}
          </Button>
        </div>
      )}

      {/* Score Result */}
      <AnimatePresence>
        {scoreResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 rounded-xl p-6 border ${
              scoreResult.score >= 80
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : scoreResult.score >= 60
                ? 'bg-yellow-500/10 border-yellow-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Pronunciation Score</h3>
              <div className={`text-4xl font-bold ${getScoreColor(scoreResult.score)}`}>
                {scoreResult.score}/100
              </div>
            </div>

            <div className="mb-4">
              <p className={`font-medium mb-2 ${getScoreColor(scoreResult.score)}`}>
                {scoreResult.feedback}
              </p>
            </div>

            <div className="mb-4 bg-black/20 rounded-lg p-4">
              <div className="mb-2">
                <span className="text-gray-400 text-sm">You said:</span>
                <p className="text-white mt-1">"{scoreResult.user_text}"</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Target:</span>
                <p className="text-gray-300 mt-1">"{scoreResult.target_text}"</p>
              </div>
            </div>

            {scoreResult.specific_feedback && scoreResult.specific_feedback.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Specific Feedback:</h4>
                <ul className="space-y-1">
                  {scoreResult.specific_feedback.map((feedback: string, index: number) => (
                    <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-yellow-400">→</span>
                      {feedback}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next Button */}
      {scoreResult && (
        <div className="flex justify-end">
          <Button
            onClick={onComplete}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 px-8"
          >
            {currentPromptIndex < totalPrompts - 1 ? 'Next Prompt →' : 'Complete Lesson ✓'}
          </Button>
        </div>
      )}

      {/* Skip Option (for testing) */}
      {!scoreResult && audioBlob && (
        <div className="text-center mt-4">
          <button
            onClick={onComplete}
            className="text-sm text-gray-500 hover:text-gray-300 underline"
          >
            Skip scoring and continue
          </button>
        </div>
      )}
    </div>
  );
}