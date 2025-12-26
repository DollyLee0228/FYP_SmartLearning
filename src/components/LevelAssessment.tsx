import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getQuestionsForAssessment } from '@/data/quizQuestions';
import { EnglishLevel, LEVELS } from '@/types/learning';
import { useLearning } from '@/context/LearningContext';
import { Sparkles, ArrowRight, RotateCcw } from 'lucide-react';

export function LevelAssessment() {
  const navigate = useNavigate();
  const { setUserLevel } = useLearning();
  const [questions] = useState(getQuestionsForAssessment()); // Initialize once
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    // Prevent selecting if already showing result
    if (showResult) return;
    
    setSelectedAnswer(answerIndex);
    
    // Immediately show result
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    setAnswers(prev => [...prev, isCorrect]);
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Move to next question and RESET states
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null); // Reset selected answer
      setShowResult(false);    // Hide result display
    } else {
      setIsComplete(true);
    }
  };

  const calculateLevel = (): EnglishLevel => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 90) return 'C2';
    if (percentage >= 75) return 'C1';
    if (percentage >= 60) return 'B2';
    if (percentage >= 45) return 'B1';
    if (percentage >= 30) return 'A2';
    return 'A1';
  };

  const handleStartLearning = () => {
    const level = calculateLevel();
    setUserLevel(level, score);
    // Store level temporarily and redirect to auth
    localStorage.setItem('smartlearning_pending_level', level);
    localStorage.setItem('smartlearning_pending_score', String(score));
    navigate('/auth');
  };

  const getLevelLabel = () => {
    const difficulty = currentQuestion.difficulty;
    if (difficulty <= 'A2') return 'Beginner';
    if (difficulty <= 'B2') return 'Intermediate';
    return 'Advanced';
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  if (isComplete) {
    const level = calculateLevel();
    const levelInfo = LEVELS[level];

    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          <div className="bg-[#111827] rounded-2xl border border-white/10 p-8 text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br from-cyan-400 to-purple-500"
            >
              <Sparkles className="w-12 h-12 text-white" />
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-2xl font-display font-bold text-white">Assessment Complete!</h2>
              <p className="text-gray-400">
                You answered {score} out of {questions.length} questions correctly
              </p>
            </div>

            <div className="py-6 space-y-4">
              <div className="inline-block">
                <div className={`level-badge-${levelInfo.color} text-lg px-6 py-3`}>
                  {levelInfo.level} - {levelInfo.name}
                </div>
              </div>
              <p className="text-gray-300 max-w-sm mx-auto">
                {levelInfo.description}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleStartLearning}
                size="lg"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold"
              >
                Start Learning
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={() => {
                  setCurrentQuestionIndex(0);
                  setSelectedAnswer(null);
                  setShowResult(false);
                  setScore(0);
                  setAnswers([]);
                  setIsComplete(false);
                }}
                variant="outline"
                size="lg"
                className="w-full border-white/20 text-white hover:bg-white/5"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Assessment
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            English Level Assessment
          </h1>
          <p className="text-gray-400">
            Answer 15 questions to determine your current level
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-[#111827] rounded-2xl border border-white/10 p-8 space-y-6">
              {/* Header with progress */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Question {currentQuestionIndex + 1} of {questions.length}</span>
                  <span className="text-cyan-400 font-medium">{getLevelLabel()}</span>
                </div>
                
                {/* Progress bar */}
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #06b6d4, #8b5cf6)',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Question */}
              <div>
                <h2 className="text-xl font-semibold text-white">{currentQuestion.question}</h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQuestion.correctAnswer;
                  const showCorrect = showResult && isCorrect;
                  const showWrong = showResult && isSelected && !isCorrect;

                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: showResult ? 1 : 1.01 }}
                      whileTap={{ scale: showResult ? 1 : 0.98 }}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResult}
                      className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center gap-4 ${
                        showCorrect
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : showWrong
                          ? 'border-red-500 bg-red-500/10'
                          : isSelected
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                        showCorrect
                          ? 'bg-emerald-500 text-white'
                          : showWrong
                          ? 'bg-red-500 text-white'
                          : isSelected
                          ? 'bg-cyan-500 text-white'
                          : 'bg-white/10 text-gray-400'
                      }`}>
                        {optionLetters[index]}
                      </span>
                      <span className={`flex-1 ${
                        showCorrect
                          ? 'text-emerald-400'
                          : showWrong
                          ? 'text-red-400'
                          : 'text-white'
                      }`}>
                        {option}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Action Button - Only show when result is visible */}
              {showResult && (
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8"
                  >
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
