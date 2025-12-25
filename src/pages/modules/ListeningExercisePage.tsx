import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Volume2, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';

interface ListeningQuestion {
  id: string;
  audioText: string;
  type: 'typing' | 'multiple-choice';
  question: string;
  options?: string[];
  correctAnswer: string;
}

const exercisesData: Record<string, { title: string; questions: ListeningQuestion[] }> = {
  'listening-1': {
    title: 'Basic Conversations',
    questions: [
      {
        id: '1',
        audioText: 'Hello, my name is Sarah.',
        type: 'typing',
        question: '请输入你听到的句子:',
        correctAnswer: 'hello my name is sarah'
      },
      {
        id: '2',
        audioText: 'How are you doing today?',
        type: 'multiple-choice',
        question: '你听到了什么?',
        options: ['How are you doing today?', 'Where are you going today?', 'What are you doing today?', 'How old are you today?'],
        correctAnswer: 'How are you doing today?'
      },
      {
        id: '3',
        audioText: 'Nice to meet you.',
        type: 'typing',
        question: '请输入你听到的句子:',
        correctAnswer: 'nice to meet you'
      },
      {
        id: '4',
        audioText: 'See you later!',
        type: 'multiple-choice',
        question: '你听到了什么?',
        options: ['See you later!', 'See you tomorrow!', 'See you never!', 'See you there!'],
        correctAnswer: 'See you later!'
      },
      {
        id: '5',
        audioText: 'Have a great day!',
        type: 'typing',
        question: '请输入你听到的句子:',
        correctAnswer: 'have a great day'
      }
    ]
  },
  'listening-2': {
    title: 'Phone Calls & Messages',
    questions: [
      {
        id: '1',
        audioText: 'Can I speak to John, please?',
        type: 'multiple-choice',
        question: '说话者想做什么?',
        options: ['和John说话', '给John发邮件', '见John', '帮助John'],
        correctAnswer: '和John说话'
      },
      {
        id: '2',
        audioText: 'Please leave a message after the beep.',
        type: 'typing',
        question: '请输入你听到的句子:',
        correctAnswer: 'please leave a message after the beep'
      },
      {
        id: '3',
        audioText: 'I will call you back later.',
        type: 'multiple-choice',
        question: '你听到了什么?',
        options: ['I will call you back later.', 'I will text you back later.', 'I will see you back later.', 'I will write you back later.'],
        correctAnswer: 'I will call you back later.'
      },
      {
        id: '4',
        audioText: 'Sorry, wrong number.',
        type: 'typing',
        question: '请输入你听到的句子:',
        correctAnswer: 'sorry wrong number'
      },
      {
        id: '5',
        audioText: 'The meeting is at three o\'clock.',
        type: 'multiple-choice',
        question: '会议是几点?',
        options: ['三点', '两点', '四点', '五点'],
        correctAnswer: '三点'
      }
    ]
  }
};

export default function ListeningExercisePage() {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  const exerciseSet = lessonId ? exercisesData[lessonId] : null;
  const questions = exerciseSet?.questions || [];
  const currentQuestion = questions[currentIndex];

  const playAudio = () => {
    if (!currentQuestion) return;
    const utterance = new SpeechSynthesisUtterance(currentQuestion.audioText);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    speechSynthesis.speak(utterance);
    setHasPlayed(true);
  };

  const checkAnswer = () => {
    if (!currentQuestion) return;

    let correct = false;
    if (currentQuestion.type === 'typing') {
      const normalizedUser = userAnswer.toLowerCase().replace(/[.,!?']/g, '').trim();
      const normalizedCorrect = currentQuestion.correctAnswer.toLowerCase().replace(/[.,!?']/g, '').trim();
      correct = normalizedUser === normalizedCorrect;
    } else {
      correct = selectedOption === currentQuestion.correctAnswer;
    }

    setIsCorrect(correct);
    setIsAnswered(true);
    if (correct) {
      setCorrectCount(correctCount + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setSelectedOption(null);
      setIsAnswered(false);
      setHasPlayed(false);
    } else {
      setIsCompleted(true);
    }
  };

  if (!exerciseSet) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] text-white flex items-center justify-center">
        <p>练习未找到</p>
      </div>
    );
  }

  const finalScore = Math.round((correctCount / questions.length) * 100);

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
            <p className="text-gray-400 mb-2">你答对了 {correctCount} / {questions.length} 题</p>
            <div className={`text-5xl font-bold mb-8 ${
              finalScore >= 70 ? 'text-emerald-400' : 'text-orange-400'
            }`}>
              {finalScore}%
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                className="border-white/10"
                onClick={() => navigate('/modules/listening')}
              >
                返回模块
              </Button>
              <Button
                className="bg-gradient-to-r from-orange-500 to-amber-500"
                onClick={() => {
                  setCurrentIndex(0);
                  setCorrectCount(0);
                  setUserAnswer('');
                  setSelectedOption(null);
                  setIsAnswered(false);
                  setIsCompleted(false);
                  setHasPlayed(false);
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
            onClick={() => navigate('/modules/listening')}
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
          <span className="text-orange-400">{currentIndex + 1} / {questions.length}</span>
        </div>
        <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-2 bg-white/10" />
      </div>

      {/* Exercise Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#111827] rounded-2xl border border-white/10 p-8"
        >
          {/* Audio Player */}
          <div className="text-center mb-8">
            <p className="text-sm text-gray-400 mb-4">点击播放音频</p>
            <Button
              size="lg"
              className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              onClick={playAudio}
            >
              <Volume2 className="w-8 h-8" />
            </Button>
            {hasPlayed && (
              <p className="text-xs text-gray-500 mt-2">可以重复播放</p>
            )}
          </div>

          {/* Question */}
          <div className="mb-6">
            <p className="text-lg font-medium mb-4">{currentQuestion?.question}</p>
            
            {currentQuestion?.type === 'typing' ? (
              <Input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="输入你听到的内容..."
                className="bg-white/5 border-white/10 text-white"
                disabled={isAnswered}
              />
            ) : (
              <div className="space-y-3">
                {currentQuestion?.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !isAnswered && setSelectedOption(option)}
                    disabled={isAnswered}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isAnswered
                        ? option === currentQuestion.correctAnswer
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : option === selectedOption
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-white/10 bg-white/5 opacity-50'
                        : selectedOption === option
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                      {isAnswered && option === currentQuestion.correctAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 ml-auto" />
                      )}
                      {isAnswered && option === selectedOption && option !== currentQuestion.correctAnswer && (
                        <XCircle className="w-5 h-5 text-red-400 ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Result Feedback */}
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-4 mb-6 ${
                isCorrect ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'
              }`}
            >
              <div className="flex items-center gap-3">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    <span className="text-emerald-400">正确!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-red-400" />
                    <div>
                      <span className="text-red-400">不对</span>
                      {currentQuestion?.type === 'typing' && (
                        <p className="text-sm text-gray-400 mt-1">
                          正确答案: {currentQuestion.audioText}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {!isAnswered ? (
              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500"
                onClick={checkAnswer}
                disabled={currentQuestion?.type === 'typing' ? !userAnswer.trim() : !selectedOption}
              >
                检查答案
              </Button>
            ) : (
              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500"
                onClick={handleNext}
              >
                {currentIndex < questions.length - 1 ? '下一题' : '完成'}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
