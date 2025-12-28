// SpeakingRecorder.tsx - 用浏览器的Web Speech API识别语音

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Volume2, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// 扩展Window类型以支持Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeakingRecorderProps {
  prompt: {
    id: number;
    type: string;
    prompt: string;
    modelSentence: string;
    tips: string[];
    targetDuration?: number;
  };
  onComplete: (score?: number) => void;
  currentPromptIndex: number;
  totalPrompts: number;
}

export default function SpeakingRecorder({
  prompt,
  onComplete,
  currentPromptIndex,
  totalPrompts,
}: SpeakingRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoreData, setScoreData] = useState<any>(null);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [isRecognizing, setIsRecognizing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // 检查浏览器是否支持Web Speech API
  const isSpeechRecognitionSupported = 
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

  // 清理函数
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [audioUrl]);

  // 播放Model Sentence（TTS）
  const playModelSentence = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(prompt.modelSentence);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      utterance.pitch = 1;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        toast.error('Audio playback failed');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      toast.error('Text-to-speech not supported');
    }
  };

  const stopModelSentence = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  // 开始录音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 设置MediaRecorder（录音）
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));

        // 停止所有音频轨道
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;

      // 设置Web Speech API（语音识别）
      if (isSpeechRecognitionSupported) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'en-US';
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        let finalTranscript = '';

        recognition.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            }
          }
          setRecognizedText(finalTranscript.trim());
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error !== 'aborted' && event.error !== 'no-speech') {
            toast.error(`Recognition error: ${event.error}`);
          }
        };

        recognition.onend = () => {
          setIsRecognizing(false);
        };

        recognitionRef.current = recognition;
      }

      // 开始录音和识别
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      setRecognizedText('');
      
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecognizing(true);
      }

      // 计时器
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to access microphone');
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      toast.success('Recording stopped');
    }
  };

  // 播放录音
  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
      toast.success('Playing your recording');
    }
  };

  // 重新录音
  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingDuration(0);
    setScoreData(null);
    setRecognizedText('');
  };

  // 提交评分
  const submitForScoring = async () => {
    console.log('=== Starting scoring process ===');
    
    if (!audioBlob) {
      toast.error('No recording to submit');
      return;
    }

    if (!isSpeechRecognitionSupported) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    console.log('Recognized text:', recognizedText);
    console.log('Target text:', prompt.modelSentence);
    console.log('Audio blob size:', audioBlob.size);

    if (!recognizedText || recognizedText.trim() === '') {
      toast.error('No speech was recognized. Please try again and speak clearly.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('target_text', prompt.modelSentence);
      formData.append('user_text', recognizedText);

      console.log('Sending request to:', 'http://localhost:5000/api/score-pronunciation');

      const response = await fetch('http://localhost:5000/api/score-pronunciation', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        // 读取详细错误
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || `HTTP ${response.status}: ${response.statusText}`;
        
        console.error('❌ API Error:', errorMessage);
        console.error('📊 Full error data:', errorData);
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Score data received:', data);
      
      setScoreData(data);
      toast.success('Score received!');
    } catch (error: any) {
      console.error('❌ Error in submitForScoring:', error);
      
      if (error.message.includes('Failed to fetch')) {
        toast.error('Cannot connect to Python API. Make sure it is running on port 5000.');
      } else {
        toast.error(error.message || 'Failed to score pronunciation');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 完成并继续
  const handleComplete = () => {
    stopModelSentence();
    // ✅ 传递当前prompt的分数
  if (scoreData && scoreData.score !== undefined) {
    console.log(`🎤 Passing score ${scoreData.score} to LessonPage`);
    onComplete(scoreData.score);
  } else {
    // 如果没有分数（用户直接跳过），传undefined
    onComplete();
  }
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {!scoreData ? (
          // 录音界面
          <motion.div
            key="recording-ui"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Progress */}
            <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
              <span>Speaking Practice {currentPromptIndex + 1} of {totalPrompts}</span>
            </div>

            {/* 提示区域 */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">📝 Instructions</h3>
              <p className="text-gray-300 leading-relaxed">{prompt.prompt}</p>
            </div>

            {/* Tips */}
            {prompt.tips && prompt.tips.length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">💡 Tips</h3>
                <ul className="space-y-2">
                  {prompt.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Model Sentence */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-cyan-400">🎯 Model Sentence</h3>
                <Button
                  onClick={isPlaying ? stopModelSentence : playModelSentence}
                  size="sm"
                  className="bg-cyan-500 hover:bg-cyan-600"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  {isPlaying ? 'Stop' : 'Play Model'}
                </Button>
              </div>
              <p className="text-gray-200 text-lg leading-relaxed italic">
                "{prompt.modelSentence}"
              </p>
              {prompt.targetDuration && (
                <p className="text-sm text-gray-400 mt-2">
                  Target duration: ~{prompt.targetDuration} seconds
                </p>
              )}
            </div>

            {/* 浏览器语音识别提示 */}
            {!isSpeechRecognitionSupported && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <p className="text-yellow-400 text-sm">
                  ⚠️ Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari for the best experience.
                </p>
              </div>
            )}

            {/* 录音控制 */}
            <div className="bg-[#0f1929] rounded-2xl p-8">
              <div className="text-center space-y-6">
                {!audioBlob ? (
                  <>
                    {/* 录音按钮 */}
                    <div className="flex flex-col items-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={!isSpeechRecognitionSupported}
                        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                          isRecording
                            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isRecording ? (
                          <Square className="w-10 h-10 text-white" />
                        ) : (
                          <Mic className="w-10 h-10 text-white" />
                        )}
                      </motion.button>

                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-white">
                          {isRecording ? 'Recording...' : 'Click to Start Recording'}
                        </p>
                        
                        {isRecording && (
                          <div className="space-y-1">
                            <p className="text-cyan-400 font-mono text-2xl">
                              {formatTime(recordingDuration)}
                            </p>
                            {isRecognizing && recognizedText && (
                              <div className="text-sm text-gray-400 mt-2 p-3 bg-white/5 rounded-lg max-w-md mx-auto">
                                <p className="text-xs text-gray-500 mb-1">Live transcription:</p>
                                <p className="text-white italic">"{recognizedText}"</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* 已录音 - 显示控制按钮 */}
                    <div className="space-y-6">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">
                          Recording Complete ({formatTime(recordingDuration)})
                        </span>
                      </div>

                      {/* 识别的文字 */}
                      {recognizedText && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-w-2xl mx-auto">
                          <p className="text-sm text-gray-400 mb-2">🗣️ What you said:</p>
                          <p className="text-white text-lg italic">"{recognizedText}"</p>
                        </div>
                      )}

                      <div className="flex justify-center gap-4">
                        <Button
                          onClick={playRecording}
                          variant="outline"
                          className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Play Recording
                        </Button>

                        <Button
                          onClick={resetRecording}
                          variant="outline"
                          className="border-white/20 text-gray-400 hover:bg-white/5"
                        >
                          Re-record
                        </Button>

                        <Button
                          onClick={submitForScoring}
                          disabled={isSubmitting || !recognizedText}
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Scoring...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Score My Pronunciation
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          // 评分结果界面
          <motion.div
            key="score-ui"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-6"
          >
            {/* 分数显示 */}
            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500/30 rounded-2xl p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.6 }}
              >
                <h2 className="text-6xl font-bold text-emerald-400 mb-2">
                  {scoreData.score}/100
                </h2>
                <p className="text-xl text-gray-300 mb-4">{scoreData.feedback}</p>
              </motion.div>

              {/* 对比文字 */}
              <div className="mt-6 space-y-4 text-left">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-2">You said:</p>
                  <p className="text-white text-lg">"{scoreData.user_text}"</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-2">Target:</p>
                  <p className="text-cyan-400 text-lg">"{scoreData.target_text}"</p>
                </div>
              </div>

              {/* Specific Feedback */}
              {scoreData.specific_feedback && scoreData.specific_feedback.length > 0 && (
                <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-blue-400 mb-2">Specific Feedback:</h3>
                  <ul className="space-y-1 text-left">
                    {scoreData.specific_feedback.map((feedback: string, index: number) => (
                      <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-blue-400">→</span>
                        <span>{feedback}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 继续按钮 */}
            <div className="flex justify-center">
              <Button
                onClick={handleComplete}
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 px-12"
              >
                {currentPromptIndex < totalPrompts - 1 ? 'Next Prompt' : 'Complete Lesson'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}