import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth'; // 假设你有这个
import { saveLessonProgress } from '@/utils/progressTracking';

const optionLetters = ['A', 'B', 'C', 'D'];

export default function LessonPage() {
  const { moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth(); 
  
  const [lesson, setLesson] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lessonStartTime] = useState(Date.now());
  const [currentSection, setCurrentSection] = useState(0);
  
  // Exercise states
  const [isExerciseMode, setIsExerciseMode] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!lessonId) {
        toast.error('Lesson ID is missing');
        navigate(-1);
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Fetching lesson:', lessonId);

        // Fetch lesson metadata
        const lessonRef = doc(db, 'lessons', lessonId);
        const lessonSnap = await getDoc(lessonRef);
        
        if (!lessonSnap.exists()) {
          console.error('❌ Lesson not found');
          toast.error('Lesson not found');
          navigate(-1);
          return;
        }

        const lessonData = { id: lessonSnap.id, ...lessonSnap.data() };
        setLesson(lessonData);
        console.log('✅ Lesson loaded:', lessonData);

        // Fetch lesson content
        const contentRef = doc(db, 'lessonContent', lessonId);
        const contentSnap = await getDoc(contentRef);
        
        if (contentSnap.exists()) {
          const contentData = contentSnap.data();
          setContent(contentData);
          console.log('✅ Content loaded:', contentData);
        } else {
          console.warn('⚠️ No content found for this lesson');
          toast.warning('Lesson content not available yet');
        }

      } catch (error: any) {
        console.error('❌ Error loading lesson:', error);
        toast.error('Failed to load lesson');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [lessonId, navigate]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading lesson...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!lesson || !content) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-xl mb-4">Lesson not found</h2>
          <Button onClick={() => navigate(-1)} className="bg-cyan-500">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const totalSections = content?.sections?.length || 0;
  const section = content?.sections?.[currentSection];
  const exercises = content?.exercises || [];
  const hasExercises = exercises.length > 0;
  
  // Calculate progress
  const totalSteps = totalSections + (hasExercises ? exercises.length : 0);
  const currentStep = isExerciseMode 
    ? totalSections + currentExercise + 1 
    : currentSection + 1;
  const progress = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;

  // Handle answer selection
  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowResult(true);
    
    if (index === exercises[currentExercise].correctAnswer) {
      setCorrectCount(prev => prev + 1);
    }
  };

  // Handle next exercise
  // const handleNextExercise = () => {
  //   if (currentExercise < exercises.length - 1) {
  //     setCurrentExercise(prev => prev + 1);
  //     setSelectedAnswer(null);
  //     setShowResult(false);
  //   } else {
  //     // Completed all exercises
  //     setIsComplete(true);
  //     toast.success(`Exercise completed! You got ${correctCount + (selectedAnswer === exercises[currentExercise].correctAnswer ? 1 : 0)}/${exercises.length} correct!`);
  //     setTimeout(() => {
  //       navigate(`/modules/${moduleId}`);
  //     }, 2000);
  //   }
  // };
  const handleNextExercise = async () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // 完成所有exercises
      const finalCorrectCount = correctCount;
      const totalQuestions = exercises.length;
      const scorePercentage = Math.round((finalCorrectCount / totalQuestions) * 100);
      const timeSpent = Math.floor((Date.now() - lessonStartTime) / 1000);

      setIsComplete(true);
      
      // 🎯 保存进度
      if (user) {  // ✅ 检查user存在
        try {
          const success = await saveLessonProgress({
            userId: user.uid,  // ✅ 用user.uid
            lessonId: lessonId!,
            moduleId: moduleId!,
            completed: true,
            score: scorePercentage,
            totalQuestions,
            correctAnswers: finalCorrectCount,
            timeSpent,
            completedAt: new Date(),
          });

          if (success) {
            toast.success(
              `🎉 Lesson completed! Score: ${finalCorrectCount}/${totalQuestions} (${scorePercentage}%)`
            );
          } else {
            toast.error('Failed to save progress');
          }
        } catch (error) {
          console.error('Error saving progress:', error);
          toast.error('Error saving progress');
        }
      } else {
        // 用户没登录
        toast.warning('Progress not saved - please login');
      }

      // 延迟后返回
      setTimeout(() => {
        navigate(`/modules/${moduleId}`);
      }, 2500);
    }
  };

  // Handle navigation to exercises
  const handleStartExercises = async () => {
  if (hasExercises) {
    setIsExerciseMode(true);
    setCurrentExercise(0);
  } else {
    // 没有exercises，直接标记完成
    if (user) {
      const timeSpent = Math.floor((Date.now() - lessonStartTime) / 1000);
      
      await saveLessonProgress({
        userId: user.uid,
        lessonId: lessonId!,
        moduleId: moduleId!,
        completed: true,
        timeSpent,
        completedAt: new Date(),
      });
      
      toast.success('🎉 Lesson completed!');
    }
    
    setTimeout(() => navigate(`/modules/${moduleId}`), 1500);
  }
};

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Header with Exit and Progress */}
      <div className="bg-[#0f1420] border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(`/modules/${moduleId}`)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Exit Lesson</span>
            </button>
            <span className="text-gray-400">{lesson.duration}</span>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-lg font-semibold">{lesson.title}</h1>
              <span className="text-cyan-400 font-semibold">{progress}%</span>
            </div>
            <Progress 
              value={progress} 
              className="h-2 bg-gray-800"
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto px-6 py-8 pb-32">
        <AnimatePresence mode="wait">
          {!isExerciseMode ? (
            // LESSON CONTENT
            <motion.div
              key={`section-${currentSection}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {section ? (
                <div className="bg-[#0f1929] rounded-2xl p-8 min-h-[500px]">
                  {/* Section Content with Custom Styling */}
                  <div className="prose-lesson">
                    <style>{`
                      .prose-lesson {
                        color: rgb(209, 213, 219);
                        line-height: 1.75;
                      }
                      
                      .prose-lesson h1 {
                        color: white;
                        font-size: 1.5rem;
                        font-weight: 600;
                        margin-bottom: 1.5rem;
                      }
                      
                      .prose-lesson h2 {
                        color: rgb(34, 211, 238);
                        font-size: 1.25rem;
                        font-weight: 600;
                        margin-top: 1.5rem;
                        margin-bottom: 1rem;
                      }
                      
                      .prose-lesson h3 {
                        color: rgb(34, 211, 238);
                        font-size: 1.125rem;
                        font-weight: 600;
                        margin-top: 1.25rem;
                        margin-bottom: 0.75rem;
                      }
                      
                      .prose-lesson p {
                        color: rgb(209, 213, 219);
                        margin-bottom: 1rem;
                      }
                      
                      .prose-lesson strong {
                        color: rgb(34, 211, 238);
                        font-weight: 600;
                      }
                      
                      .prose-lesson ul,
                      .prose-lesson ol {
                        margin-left: 1.5rem;
                        margin-bottom: 1rem;
                      }
                      
                      .prose-lesson li {
                        color: rgb(209, 213, 219);
                        margin-bottom: 0.5rem;
                        line-height: 1.75;
                      }
                      
                      .prose-lesson code {
                        color: rgb(34, 211, 238);
                        background-color: rgba(34, 211, 238, 0.1);
                        padding: 0.125rem 0.375rem;
                        border-radius: 0.25rem;
                        font-size: 0.875em;
                      }
                    `}</style>
                    
                    <ReactMarkdown>{section.content}</ReactMarkdown>
                  </div>

                  {/* Tables */}
                  {section.tables && section.tables.length > 0 && (
                    <div className="mt-6 space-y-6">
                      {section.tables.map((table: any, idx: number) => (
                        <div key={idx}>
                          <h3 className="text-cyan-400 font-semibold mb-3">{table.title}</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-gray-700">
                                  {table.columns?.map((col: any) => (
                                    <th 
                                      key={col.key} 
                                      className="px-4 py-3 text-left text-sm font-semibold text-gray-400"
                                    >
                                      {col.label}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {table.rows?.map((row: any, rowIdx: number) => (
                                  <tr 
                                    key={rowIdx} 
                                    className="border-b border-gray-800"
                                  >
                                    {table.columns?.map((col: any) => (
                                      <td 
                                        key={col.key} 
                                        className="px-4 py-3 text-gray-300"
                                      >
                                        {row[col.key]}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Examples */}
                  {section.examples && section.examples.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-cyan-400 font-semibold mb-4">Examples:</h3>
                      <div className="space-y-3">
                        {section.examples.map((example: any, idx: number) => (
                          <div key={idx}>
                            {example.sentences?.map((sent: any, sIdx: number) => (
                              <div key={sIdx} className="mb-2">
                                <p className="text-gray-200">
                                  • {sent.english}
                                </p>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vocabulary */}
                  {section.vocabulary && section.vocabulary.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-cyan-400 font-semibold mb-4">Vocabulary:</h3>
                      <div className="space-y-3">
                        {section.vocabulary.map((vocab: any, idx: number) => (
                          <div key={idx} className="bg-[#0a0f1a] p-4 rounded-lg">
                            <div className="font-semibold text-cyan-400 mb-1">{vocab.word}</div>
                            <div className="text-sm text-gray-400 mb-2">{vocab.definition}</div>
                            {vocab.example && (
                              <div className="text-sm text-gray-300 italic">
                                "{vocab.example}"
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#0f1929] rounded-2xl p-8 text-center">
                  <p className="text-gray-400">No content available</p>
                </div>
              )}
            </motion.div>
          ) : (
            // EXERCISES MODE
            <motion.div
              key={`exercise-${currentExercise}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bg-[#0f1929] rounded-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-400">Exercise {currentExercise + 1} of {exercises.length}</span>
                  <span className="text-cyan-400 font-medium">Practice</span>
                </div>

                <h2 className="text-xl font-semibold mb-6">{exercises[currentExercise].question}</h2>

                <div className="space-y-3 mb-6">
                  {exercises[currentExercise].options.map((option: string, index: number) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === exercises[currentExercise].correctAnswer;
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
                          {showCorrect ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : showWrong ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            optionLetters[index]
                          )}
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
                    className={`p-4 rounded-xl mb-4 ${
                      selectedAnswer === exercises[currentExercise].correctAnswer
                        ? 'bg-emerald-500/10 border border-emerald-500/30'
                        : 'bg-amber-500/10 border border-amber-500/30'
                    }`}
                  >
                    <p className={`font-medium mb-1 ${
                      selectedAnswer === exercises[currentExercise].correctAnswer
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}>
                      {selectedAnswer === exercises[currentExercise].correctAnswer ? 'Correct! ✓' : 'Not quite right'}
                    </p>
                    <p className="text-gray-300 text-sm">{exercises[currentExercise].explanation}</p>
                  </motion.div>
                )}

                {showResult && (
                  <div className="flex justify-end">
                    <Button
                      onClick={handleNextExercise}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                    >
                      {currentExercise < exercises.length - 1 ? 'Next Exercise' : 'Complete Lesson'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0f1a] border-t border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {!isExerciseMode ? (
            <>
              <Button
                onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
                disabled={currentSection === 0}
                variant="ghost"
                className="text-gray-400 disabled:opacity-30"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentSection < totalSections - 1 ? (
                <Button
                  onClick={() => setCurrentSection(prev => prev + 1)}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-8"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleStartExercises}
                  className="bg-green-500 hover:bg-green-600 text-white px-8"
                >
                  {hasExercises ? 'Start Exercises' : 'Complete'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </>
          ) : (
            <div className="w-full flex justify-center">
              <span className="text-gray-400 text-sm">
                Answer the question to continue
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}