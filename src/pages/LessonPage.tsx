import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, BookOpen, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LessonContent } from '@/types/learning';
import { grammarLessons, vocabularyLessons, readingLessons, listeningLessons, writingLessons, speakingLessons } from '@/data/lessonContent';
import ReactMarkdown from 'react-markdown';

const allLessons: Record<string, LessonContent> = {
  ...grammarLessons,
  ...vocabularyLessons,
  ...readingLessons,
  ...listeningLessons,
  ...writingLessons,
  ...speakingLessons,
};

export default function LessonPage() {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();
  const [currentSection, setCurrentSection] = useState(0);
  const [isExerciseMode, setIsExerciseMode] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const lesson = allLessons[lessonId || ''];

  if (!lesson) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
          <Button onClick={() => navigate(`/modules/${moduleId}`)}>
            Back to Module
          </Button>
        </div>
      </div>
    );
  }

  const totalSteps = lesson.sections.length + lesson.exercises.length;
  const currentStep = isExerciseMode 
    ? lesson.sections.length + currentExercise + 1 
    : currentSection + 1;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (!isExerciseMode) {
      if (currentSection < lesson.sections.length - 1) {
        setCurrentSection(prev => prev + 1);
      } else {
        setIsExerciseMode(true);
        setCurrentExercise(0);
      }
    }
  };

  const handlePrev = () => {
    if (isExerciseMode) {
      if (currentExercise > 0) {
        setCurrentExercise(prev => prev - 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setIsExerciseMode(false);
        setCurrentSection(lesson.sections.length - 1);
      }
    } else {
      if (currentSection > 0) {
        setCurrentSection(prev => prev - 1);
      }
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    
    const exercise = lesson.exercises[currentExercise];
    if (index === exercise.correctAnswer) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNextExercise = () => {
    if (currentExercise < lesson.exercises.length - 1) {
      setCurrentExercise(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
    }
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  if (isComplete) {
    const percentage = Math.round((correctCount / lesson.exercises.length) * 100);
    return (
      <div className="min-h-screen bg-[#0a0f1a] text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#111827] rounded-2xl border border-white/10 p-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold mb-2">Lesson Complete!</h2>
              <p className="text-gray-400">{lesson.title}</p>
            </div>

            <div className="py-4">
              <div className="text-5xl font-bold text-emerald-400 mb-2">{percentage}%</div>
              <p className="text-gray-400">
                {correctCount} of {lesson.exercises.length} exercises correct
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                onClick={() => {
                  setIsComplete(false);
                  setIsExerciseMode(true);
                  setCurrentExercise(0);
                  setSelectedAnswer(null);
                  setShowResult(false);
                  setCorrectCount(0);
                }}
              >
                Retry Exercises
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                onClick={() => navigate(`/modules/${moduleId}`)}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Header */}
      <div className="bg-[#111827] border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(`/modules/${moduleId}`)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Exit Lesson
            </button>
            <span className="text-gray-400 text-sm">{lesson.duration}</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white font-medium">{lesson.title}</span>
              <span className="text-cyan-400">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/10" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {!isExerciseMode ? (
            // Learning Content
            <motion.div
              key={`section-${currentSection}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Section {currentSection + 1} of {lesson.sections.length}</p>
                  <h2 className="text-xl font-semibold">{lesson.sections[currentSection].title}</h2>
                </div>
              </div>

              <div className="bg-[#111827] rounded-2xl border border-white/10 p-8">
                {lesson.sections[currentSection].type === 'theory' && (
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="text-gray-300 mb-4 leading-relaxed">{children}</p>,
                        strong: ({ children }) => <strong className="text-cyan-400 font-semibold">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc list-inside space-y-2 text-gray-300">{children}</ul>,
                        li: ({ children }) => <li>{children}</li>,
                      }}
                    >
                      {lesson.sections[currentSection].content || ''}
                    </ReactMarkdown>
                  </div>
                )}

                {lesson.sections[currentSection].type === 'examples' && (
                  <div className="space-y-4">
                    {lesson.sections[currentSection].items?.map((item, idx) => (
                      <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <p className="text-white font-medium mb-2">"{item.sentence}"</p>
                        <p className="text-sm text-cyan-400">→ {item.explanation}</p>
                      </div>
                    ))}
                  </div>
                )}

                {lesson.sections[currentSection].type === 'vocabulary' && (
                  <div className="space-y-4">
                    {lesson.sections[currentSection].words?.map((word, idx) => (
                      <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-lg font-semibold text-white">{word.word}</h4>
                        </div>
                        <p className="text-gray-400 mb-2">{word.definition}</p>
                        <p className="text-sm text-cyan-400">Example: "{word.example}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentSection === 0}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-30"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                >
                  {currentSection < lesson.sections.length - 1 ? 'Next' : 'Start Exercises'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          ) : (
            // Exercises
            <motion.div
              key={`exercise-${currentExercise}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bg-[#111827] rounded-2xl border border-white/10 p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Exercise {currentExercise + 1} of {lesson.exercises.length}</span>
                  <span className="text-cyan-400 font-medium">Practice</span>
                </div>

                <h2 className="text-xl font-semibold">{lesson.exercises[currentExercise].question}</h2>

                <div className="space-y-3">
                  {lesson.exercises[currentExercise].options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === lesson.exercises[currentExercise].correctAnswer;
                    const showCorrect = showResult && isCorrect;
                    const showWrong = showResult && isSelected && !isCorrect;

                    return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: showResult ? 1 : 1.01 }}
                        whileTap={{ scale: showResult ? 1 : 0.98 }}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showResult}
                        className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${
                          showCorrect
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : showWrong
                            ? 'border-red-500 bg-red-500/10'
                            : isSelected
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
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
                          {showCorrect ? <CheckCircle2 className="w-4 h-4" /> : showWrong ? <XCircle className="w-4 h-4" /> : optionLetters[index]}
                        </span>
                        <span className={showCorrect ? 'text-emerald-400' : showWrong ? 'text-red-400' : 'text-white'}>
                          {option}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl ${
                      selectedAnswer === lesson.exercises[currentExercise].correctAnswer
                        ? 'bg-emerald-500/10 border border-emerald-500/30'
                        : 'bg-amber-500/10 border border-amber-500/30'
                    }`}
                  >
                    <p className={`font-medium mb-1 ${
                      selectedAnswer === lesson.exercises[currentExercise].correctAnswer
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}>
                      {selectedAnswer === lesson.exercises[currentExercise].correctAnswer ? 'Correct!' : 'Not quite right'}
                    </p>
                    <p className="text-gray-300 text-sm">{lesson.exercises[currentExercise].explanation}</p>
                  </motion.div>
                )}

                {showResult && (
                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={handleNextExercise}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                    >
                      {currentExercise < lesson.exercises.length - 1 ? 'Next Exercise' : 'Complete Lesson'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
