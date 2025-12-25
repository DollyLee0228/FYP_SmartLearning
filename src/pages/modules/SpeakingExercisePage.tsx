import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mic, MicOff, Volume2, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface SpeakingExercise {
  id: string;
  title: string;
  targetText: string;
  translation: string;
}

const exercisesData: Record<string, { title: string; exercises: SpeakingExercise[] }> = {
  'speaking-1': {
    title: 'Basic Pronunciation',
    exercises: [
      { id: '1', title: 'Greetings', targetText: 'Hello, how are you today?', translation: '你好，你今天好吗？' },
      { id: '2', title: 'Introduction', targetText: 'My name is John.', translation: '我的名字是约翰。' },
      { id: '3', title: 'Polite Request', targetText: 'Could you please help me?', translation: '你能帮帮我吗？' },
      { id: '4', title: 'Thank You', targetText: 'Thank you very much!', translation: '非常感谢！' },
      { id: '5', title: 'Goodbye', targetText: 'See you tomorrow!', translation: '明天见！' },
    ]
  },
  'speaking-2': {
    title: 'Vowel Sounds',
    exercises: [
      { id: '1', title: 'Short A', targetText: 'The cat sat on the mat.', translation: '猫坐在垫子上。' },
      { id: '2', title: 'Long E', targetText: 'Please eat these green peas.', translation: '请吃这些绿豌豆。' },
      { id: '3', title: 'Short I', targetText: 'This is a big fish.', translation: '这是一条大鱼。' },
      { id: '4', title: 'Long O', targetText: 'Go home and open the door.', translation: '回家开门。' },
      { id: '5', title: 'Short U', targetText: 'The cup is full of nuts.', translation: '杯子装满了坚果。' },
    ]
  }
};

export default function SpeakingExercisePage() {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const recognitionRef = useRef<any>(null);

  const exerciseSet = lessonId ? exercisesData[lessonId] : null;
  const exercises = exerciseSet?.exercises || [];
  const currentExercise = exercises[currentIndex];

  useEffect(() => {
    // Check for Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        calculateScore(result);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'no-speech') {
          toast.error('未检测到语音，请再试一次');
        } else if (event.error === 'not-allowed') {
          toast.error('请允许麦克风权限');
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const calculateScore = (spokenText: string) => {
    if (!currentExercise) return;
    
    const target = currentExercise.targetText.toLowerCase().replace(/[.,!?]/g, '');
    const spoken = spokenText.toLowerCase().replace(/[.,!?]/g, '');
    
    const targetWords = target.split(' ');
    const spokenWords = spoken.split(' ');
    
    let matchCount = 0;
    targetWords.forEach(word => {
      if (spokenWords.includes(word)) matchCount++;
    });
    
    const accuracy = Math.round((matchCount / targetWords.length) * 100);
    setScore(accuracy);
  };

  const startRecording = async () => {
    if (!recognitionRef.current) {
      toast.error('您的浏览器不支持语音识别');
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setTranscript('');
      setScore(null);
      setIsRecording(true);
      recognitionRef.current.start();
    } catch (error) {
      toast.error('请允许麦克风权限');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (!currentExercise) return;
    const utterance = new SpeechSynthesisUtterance(currentExercise.targetText);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  };

  const handleNext = () => {
    if (score !== null) {
      setScores([...scores, score]);
    }

    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTranscript('');
      setScore(null);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRetry = () => {
    setTranscript('');
    setScore(null);
  };

  if (!exerciseSet) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] text-white flex items-center justify-center">
        <p>练习未找到</p>
      </div>
    );
  }

  const finalScore = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] text-white">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111827] rounded-2xl border border-white/10 p-8 text-center"
          >
            <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
              finalScore >= 70 ? 'bg-emerald-500/20' : 'bg-orange-500/20'
            }`}>
              {finalScore >= 70 ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              ) : (
                <RotateCcw className="w-10 h-10 text-orange-400" />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2">练习完成!</h2>
            <p className="text-gray-400 mb-6">你的平均发音准确率</p>
            <div className={`text-5xl font-bold mb-8 ${
              finalScore >= 70 ? 'text-emerald-400' : 'text-orange-400'
            }`}>
              {finalScore}%
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                className="border-white/10"
                onClick={() => navigate('/modules/speaking')}
              >
                返回模块
              </Button>
              <Button
                className="bg-gradient-to-r from-rose-500 to-orange-500"
                onClick={() => {
                  setCurrentIndex(0);
                  setScores([]);
                  setTranscript('');
                  setScore(null);
                  setIsCompleted(false);
                }}
              >
                再练一次
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Header */}
      <div className="bg-[#111827] border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/modules/speaking')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-2xl mx-auto px-6 pt-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">{exerciseSet.title}</span>
          <span className="text-rose-400">{currentIndex + 1} / {exercises.length}</span>
        </div>
        <Progress value={((currentIndex + 1) / exercises.length) * 100} className="h-2 bg-white/10" />
      </div>

      {/* Exercise Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#111827] rounded-2xl border border-white/10 p-8"
        >
          <p className="text-sm text-gray-400 mb-4">{currentExercise?.title}</p>
          
          {/* Target Text */}
          <div className="bg-white/5 rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xl font-medium mb-2">{currentExercise?.targetText}</p>
                <p className="text-sm text-gray-500">{currentExercise?.translation}</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0"
                onClick={playAudio}
              >
                <Volume2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Recording Section */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-400 mb-4">点击麦克风开始录音</p>
            <Button
              size="lg"
              className={`w-20 h-20 rounded-full ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600'
              }`}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </Button>
            {isRecording && (
              <p className="text-sm text-red-400 mt-3">正在录音...</p>
            )}
          </div>

          {/* Transcript & Score */}
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 rounded-xl p-4 mb-6"
            >
              <p className="text-sm text-gray-400 mb-2">你说的:</p>
              <p className="text-lg">{transcript}</p>
            </motion.div>
          )}

          {score !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-4 mb-6 ${
                score >= 70 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-orange-500/10 border border-orange-500/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {score >= 70 ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-orange-400" />
                  )}
                  <span className={score >= 70 ? 'text-emerald-400' : 'text-orange-400'}>
                    {score >= 70 ? '很好!' : '继续努力!'}
                  </span>
                </div>
                <span className={`text-2xl font-bold ${score >= 70 ? 'text-emerald-400' : 'text-orange-400'}`}>
                  {score}%
                </span>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {score !== null && (
              <Button
                variant="outline"
                className="flex-1 border-white/10"
                onClick={handleRetry}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                重试
              </Button>
            )}
            {score !== null && (
              <Button
                className="flex-1 bg-gradient-to-r from-rose-500 to-orange-500"
                onClick={handleNext}
              >
                {currentIndex < exercises.length - 1 ? '下一个' : '完成'}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
