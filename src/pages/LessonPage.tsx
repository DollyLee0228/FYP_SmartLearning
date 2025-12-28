import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2, XCircle, BookOpen, Volume2, PenTool, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
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
  const [typedAnswer, setTypedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Audio state for listening
  const [isPlaying, setIsPlaying] = useState(false);

  // ✅ Writing states
  const [essay, setEssay] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [essaySubmitted, setEssaySubmitted] = useState(false);

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

  // ✅ 检测module类型
  const isReading = moduleId === 'reading';
  const isListening = moduleId === 'listening';
  const isWriting = moduleId === 'writing';
  
  const hasReadingExercise = content?.readingExercise && content.readingExercise.questions?.length > 0;
  const hasListeningExercises = content?.listeningExercises && content.listeningExercises.length > 0;
  const hasWritingPrompt = content?.writingPrompt;

  const totalSections = content?.sections?.length || 0;
  const section = content?.sections?.[currentSection];
  
  // ✅ 根据module type选择exercises
  const exercises = isListening && hasListeningExercises 
    ? content.listeningExercises 
    : isReading && hasReadingExercise 
    ? content.readingExercise.questions 
    : (content?.exercises || []);
  
  const hasExercises = exercises.length > 0;
  
  const totalSteps = totalSections + (hasExercises ? exercises.length : 0);
  const currentStep = isExerciseMode 
    ? totalSections + currentExercise + 1 
    : currentSection + 1;
  const progress = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;

  // ✅ 检查当前exercise的类型
  const currentExerciseData = exercises[currentExercise];
  const exerciseType = currentExerciseData?.type || 'multiple-choice';

  // ✅ Writing word count
  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;
  const writingPrompt = content?.writingPrompt;
  const isWithinLimit = writingPrompt 
    ? wordCount >= writingPrompt.wordLimit.min && wordCount <= writingPrompt.wordLimit.max
    : true;
  const canSubmitEssay = writingPrompt 
    ? wordCount >= writingPrompt.wordLimit.min
    : false;

  // ✅ Audio播放功能
  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        toast.error('Audio playback failed');
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error('Text-to-speech not supported in this browser');
    }
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null || showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    
    if (index === currentExerciseData.correctAnswer) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleTypingSubmit = () => {
    if (showResult) return;
    
    setShowResult(true);
    
    const userAnswer = typedAnswer.trim().toLowerCase();
    const correctAnswers = currentExerciseData.acceptedAnswers || [currentExerciseData.correctAnswer];
    
    const isCorrect = correctAnswers.some((answer: string) => 
      answer.toLowerCase() === userAnswer
    );
    
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
  };

  // ✅ Submit essay for writing
  const handleEssaySubmit = async () => {
    if (!canSubmitEssay) return;
    
    setIsSubmitting(true);
    
    // Simulate API call (in real app, save to Firebase)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setEssaySubmitted(true);
    setIsSubmitting(false);
    
    // Save progress
    if (user) {
      const timeSpent = Math.floor((Date.now() - lessonStartTime) / 1000);
      
      try {
        await saveLessonProgress({
          userId: user.uid,
          lessonId: lessonId!,
          moduleId: moduleId!,
          completed: true,
          timeSpent,
          completedAt: new Date(),
        });
        
        toast.success('🎉 Essay submitted! Lesson completed!');
      } catch (error) {
        console.error('Error saving progress:', error);
        toast.error('Failed to save progress');
      }
    }
    
    // Navigate back after delay
    setTimeout(() => {
      navigate(`/modules/${moduleId}`);
    }, 2500);
  };

  const handleNextExercise = async () => {
    stopAudio();
    
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(prev => prev + 1);
      setSelectedAnswer(null);
      setTypedAnswer('');
      setShowResult(false);
    } else {
      const finalCorrectCount = correctCount;
      const totalQuestions = exercises.length;
      const scorePercentage = Math.round((finalCorrectCount / totalQuestions) * 100);
      const timeSpent = Math.floor((Date.now() - lessonStartTime) / 1000);

      setIsComplete(true);
      
      if (user) {
        try {
          const success = await saveLessonProgress({
            userId: user.uid,
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
        toast.warning('Progress not saved - please login');
      }

      setTimeout(() => {
        navigate(`/modules/${moduleId}`);
      }, 2500);
    }
  };

  const handleStartExercises = async () => {
    if (isWriting && hasWritingPrompt) {
      // For writing, start writing exercise
      setIsExerciseMode(true);
    } else if (hasExercises) {
      setIsExerciseMode(true);
      setCurrentExercise(0);
    } else {
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

  const isTypingCorrect = () => {
    if (exerciseType !== 'typing') return false;
    
    const userAnswer = typedAnswer.trim().toLowerCase();
    const correctAnswers = currentExerciseData.acceptedAnswers || [currentExerciseData.correctAnswer];
    
    return correctAnswers.some((answer: string) => 
      answer.toLowerCase() === userAnswer
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Header */}
      <div className="bg-[#0f1420] border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                stopAudio();
                navigate(`/modules/${moduleId}`);
              }}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Exit Lesson</span>
            </button>
            <span className="text-gray-400">{lesson.duration}</span>
          </div>

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
      <div className={`${(isReading && isExerciseMode) || (isWriting && isExerciseMode) ? 'max-w-7xl' : 'max-w-4xl'} mx-auto px-6 py-8 pb-32`}>
        <AnimatePresence mode="wait">
          {!isExerciseMode ? (
            // LESSON CONTENT (Sections)
            <motion.div
              key={`section-${currentSection}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {section ? (
                <div className="bg-[#0f1929] rounded-2xl p-8 min-h-[500px]">
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
                      .prose-lesson ul, .prose-lesson ol {
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

                  {/* Tables, Examples, Vocabulary */}
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
                                    <th key={col.key} className="px-4 py-3 text-left text-sm font-semibold text-gray-400">
                                      {col.label}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {table.rows?.map((row: any, rowIdx: number) => (
                                  <tr key={rowIdx} className="border-b border-gray-800">
                                    {table.columns?.map((col: any) => (
                                      <td key={col.key} className="px-4 py-3 text-gray-300">
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

                  {section.examples && section.examples.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-cyan-400 font-semibold mb-4">Examples:</h3>
                      <div className="space-y-3">
                        {section.examples.map((example: any, idx: number) => (
                          <div key={idx}>
                            {example.sentences?.map((sent: any, sIdx: number) => (
                              <div key={sIdx} className="mb-2">
                                <p className="text-gray-200">• {sent.english}</p>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {section.vocabulary && section.vocabulary.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-cyan-400 font-semibold mb-4">Vocabulary:</h3>
                      <div className="space-y-3">
                        {section.vocabulary.map((vocab: any, idx: number) => (
                          <div key={idx} className="bg-[#0a0f1a] p-4 rounded-lg">
                            <div className="font-semibold text-cyan-400 mb-1">{vocab.word}</div>
                            <div className="text-sm text-gray-400 mb-2">{vocab.definition}</div>
                            {vocab.example && (
                              <div className="text-sm text-gray-300 italic">"{vocab.example}"</div>
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
          ) : isWriting && hasWritingPrompt ? (
            // ✅ WRITING EXERCISE MODE
            <motion.div
              key="writing-exercise"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {essaySubmitted ? (
                // Submitted view
                <div className="bg-[#111827] rounded-xl border border-white/10 p-8 text-center max-w-2xl mx-auto">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Essay Submitted!</h2>
                  <p className="text-gray-400 mb-6">
                    Your essay has been submitted successfully. Lesson completed!
                  </p>
                  
                  <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <PenTool className="w-4 h-4" />
                      <span>Word count: {wordCount} words</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/modules/${moduleId}`)}
                      className="border-white/10 text-gray-300 hover:bg-white/5"
                    >
                      Back to Writing
                    </Button>
                    <Button
                      onClick={() => navigate('/dashboard')}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                </div>
              ) : (
                // Writing view
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Prompt + Tips */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-[#111827] rounded-xl border border-white/10 p-5">
                      <h2 className="text-lg font-semibold mb-3 text-emerald-400">Writing Prompt</h2>
                      <div className="text-gray-300 whitespace-pre-line text-sm leading-relaxed">
                        {writingPrompt.prompt}
                      </div>
                    </div>

                    <div className="bg-[#111827] rounded-xl border border-white/10 p-5">
                      <h2 className="text-lg font-semibold mb-3 text-blue-400">Writing Tips</h2>
                      <ul className="space-y-2">
                        {writingPrompt.tips.map((tip: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-400">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right: Essay Writing Area */}
                  <div className="lg:col-span-2">
                    <div className="bg-[#111827] rounded-xl border border-white/10 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Your Essay</h2>
                        <div className={`text-sm font-medium ${
                          wordCount === 0
                            ? 'text-gray-500'
                            : isWithinLimit
                            ? 'text-emerald-400'
                            : wordCount < writingPrompt.wordLimit.min
                            ? 'text-yellow-400'
                            : 'text-red-400'
                        }`}>
                          {wordCount} / {writingPrompt.wordLimit.min}-{writingPrompt.wordLimit.max} words
                        </div>
                      </div>

                      <Textarea
                        value={essay}
                        onChange={(e) => setEssay(e.target.value)}
                        placeholder="Start writing your essay here..."
                        className="min-h-[400px] bg-white/5 border-white/10 text-white placeholder:text-gray-500 resize-none focus:border-emerald-500/50 focus:ring-emerald-500/20"
                      />

                      {wordCount > 0 && wordCount < writingPrompt.wordLimit.min && (
                        <p className="text-sm text-yellow-400 mt-2">
                          Write at least {writingPrompt.wordLimit.min - wordCount} more words to submit
                        </p>
                      )}

                      {wordCount > writingPrompt.wordLimit.max && (
                        <p className="text-sm text-red-400 mt-2">
                          You are {wordCount - writingPrompt.wordLimit.max} words over the limit
                        </p>
                      )}

                      <div className="flex justify-end mt-6">
                        <Button
                          size="lg"
                          onClick={handleEssaySubmit}
                          disabled={!canSubmitEssay || isSubmitting}
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-8"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Submit Essay
                            </>
                          )}
                        </Button>
                      </div>

                      <p className="text-xs text-gray-500 mt-4 text-center">
                        Your essay will be saved and the lesson will be marked as complete.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            // EXERCISES MODE (Reading, Listening, Grammar, Vocabulary)
            <motion.div
              key={`exercise-${currentExercise}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {isReading && hasReadingExercise ? (
                // Reading: 左右布局
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-[#0f1929] rounded-2xl p-8 lg:sticky lg:top-6 lg:self-start">
                    <div className="flex items-center gap-3 mb-6">
                      <BookOpen className="w-6 h-6 text-cyan-400" />
                      <h2 className="text-xl font-semibold text-cyan-400">Reading Passage</h2>
                    </div>
                    <div className="prose-lesson max-h-[600px] overflow-y-auto pr-4">
                      <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {content.readingExercise.passage}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#0f1929] rounded-2xl p-8">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-gray-400">Question {currentExercise + 1} of {exercises.length}</span>
                      <span className="text-cyan-400 font-medium">Practice</span>
                    </div>

                    <h2 className="text-xl font-semibold mb-6">{currentExerciseData.question}</h2>

                    <div className="space-y-3 mb-6">
                      {currentExerciseData.options.map((option: string, index: number) => {
                        const isSelected = selectedAnswer === index;
                        const isCorrect = index === currentExerciseData.correctAnswer;
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
                              showCorrect ? 'border-emerald-500 bg-emerald-500/10' :
                              showWrong ? 'border-red-500 bg-red-500/10' :
                              isSelected ? 'border-cyan-500 bg-cyan-500/10' :
                              'border-white/10 bg-white/5 hover:border-white/20'
                            }`}
                          >
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                              showCorrect ? 'bg-emerald-500 text-white' :
                              showWrong ? 'bg-red-500 text-white' :
                              isSelected ? 'bg-cyan-500 text-white' :
                              'bg-white/10 text-gray-400'
                            }`}>
                              {showCorrect ? <CheckCircle2 className="w-4 h-4" /> :
                               showWrong ? <XCircle className="w-4 h-4" /> :
                               optionLetters[index]}
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
                          selectedAnswer === currentExerciseData.correctAnswer
                            ? 'bg-emerald-500/10 border border-emerald-500/30'
                            : 'bg-amber-500/10 border border-amber-500/30'
                        }`}
                      >
                        <p className={`font-medium mb-1 ${
                          selectedAnswer === currentExerciseData.correctAnswer
                            ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {selectedAnswer === currentExerciseData.correctAnswer ? 'Correct! ✓' : 'Not quite right'}
                        </p>
                        <p className="text-gray-300 text-sm">{currentExerciseData.explanation}</p>
                      </motion.div>
                    )}

                    {showResult && (
                      <div className="flex justify-end">
                        <Button
                          onClick={handleNextExercise}
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                        >
                          {currentExercise < exercises.length - 1 ? 'Next Question' : 'Complete Lesson'}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Grammar/Vocabulary/Listening: 正常布局
                <div className="bg-[#0f1929] rounded-2xl p-8 max-w-3xl mx-auto">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-400">
                      Exercise {currentExercise + 1} of {exercises.length}
                    </span>
                    <span className="text-cyan-400 font-medium">Practice</span>
                  </div>

                  {/* Audio Player for Listening */}
                  {isListening && currentExerciseData.audioText && (
                    <div className="mb-6 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Volume2 className="w-5 h-5 text-orange-400" />
                          <span className="text-sm text-orange-300 font-medium">
                            {isPlaying ? 'Playing audio...' : 'Click to listen'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => playAudio(currentExerciseData.audioText)}
                            disabled={isPlaying}
                            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                          >
                            <Volume2 className="w-4 h-4 mr-2" />
                            {isPlaying ? 'Playing...' : 'Play Audio'}
                          </Button>
                          {isPlaying && (
                            <Button
                              onClick={stopAudio}
                              variant="outline"
                              className="border-orange-500/30 text-orange-400"
                            >
                              Stop
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <h2 className="text-xl font-semibold mb-6">{currentExerciseData.question}</h2>

                  {exerciseType === 'typing' ? (
                    // TYPING EXERCISE
                    <div className="space-y-6">
                      <div>
                        <Input
                          type="text"
                          value={typedAnswer}
                          onChange={(e) => setTypedAnswer(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !showResult && typedAnswer.trim()) {
                              handleTypingSubmit();
                            }
                          }}
                          disabled={showResult}
                          placeholder="Type your answer here..."
                          className="w-full text-lg p-4 bg-white/5 border-white/10 focus:border-cyan-500 text-white placeholder:text-gray-500"
                        />
                        {!showResult && (
                          <p className="text-sm text-gray-400 mt-2">Press Enter or click Submit to check your answer</p>
                        )}
                      </div>

                      {!showResult && (
                        <Button
                          onClick={handleTypingSubmit}
                          disabled={!typedAnswer.trim()}
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 w-full"
                        >
                          Submit Answer
                        </Button>
                      )}

                      {showResult && (
                        <>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-xl ${
                              isTypingCorrect()
                                ? 'bg-emerald-500/10 border border-emerald-500/30'
                                : 'bg-amber-500/10 border border-amber-500/30'
                            }`}
                          >
                            <div className="flex items-start gap-3 mb-3">
                              {isTypingCorrect() ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
                              ) : (
                                <XCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <p className={`font-medium mb-1 ${
                                  isTypingCorrect() ? 'text-emerald-400' : 'text-amber-400'
                                }`}>
                                  {isTypingCorrect() ? 'Correct! ✓' : 'Not quite right'}
                                </p>
                                <p className="text-sm text-gray-400 mb-2">Your answer: <span className="text-white">{typedAnswer}</span></p>
                                {!isTypingCorrect() && (
                                  <p className="text-sm text-gray-400">
                                    Correct answer: <span className="text-cyan-400">{currentExerciseData.correctAnswer}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-300 text-sm">{currentExerciseData.explanation}</p>
                          </motion.div>

                          <div className="flex justify-end">
                            <Button
                              onClick={handleNextExercise}
                              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                            >
                              {currentExercise < exercises.length - 1 ? 'Next Exercise' : 'Complete Lesson'}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    // MULTIPLE CHOICE EXERCISE
                    <>
                      <div className="space-y-3 mb-6">
                        {currentExerciseData.options.map((option: string, index: number) => {
                          const isSelected = selectedAnswer === index;
                          const isCorrect = index === currentExerciseData.correctAnswer;
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
                                showCorrect ? 'border-emerald-500 bg-emerald-500/10' :
                                showWrong ? 'border-red-500 bg-red-500/10' :
                                isSelected ? 'border-cyan-500 bg-cyan-500/10' :
                                'border-white/10 bg-white/5 hover:border-white/20'
                              }`}
                            >
                              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                                showCorrect ? 'bg-emerald-500 text-white' :
                                showWrong ? 'bg-red-500 text-white' :
                                isSelected ? 'bg-cyan-500 text-white' :
                                'bg-white/10 text-gray-400'
                              }`}>
                                {showCorrect ? <CheckCircle2 className="w-4 h-4" /> :
                                 showWrong ? <XCircle className="w-4 h-4" /> :
                                 optionLetters[index]}
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
                            selectedAnswer === currentExerciseData.correctAnswer
                              ? 'bg-emerald-500/10 border border-emerald-500/30'
                              : 'bg-amber-500/10 border border-amber-500/30'
                          }`}
                        >
                          <p className={`font-medium mb-1 ${
                            selectedAnswer === currentExerciseData.correctAnswer
                              ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            {selectedAnswer === currentExerciseData.correctAnswer ? 'Correct! ✓' : 'Not quite right'}
                          </p>
                          <p className="text-gray-300 text-sm">{currentExerciseData.explanation}</p>
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
                    </>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0f1a] border-t border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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
                  {isWriting && hasWritingPrompt 
                    ? 'Start Writing' 
                    : hasExercises 
                    ? (isReading ? 'Start Reading' : isListening ? 'Start Listening' : 'Start Exercises') 
                    : 'Complete'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </>
          ) : (
            <div className="w-full flex justify-center">
              <span className="text-gray-400 text-sm">
                {isWriting
                  ? 'Write your essay following the prompt and tips'
                  : isReading 
                  ? 'Read the passage on the left and answer the question'
                  : isListening
                  ? 'Listen to the audio and answer the question'
                  : exerciseType === 'typing'
                  ? 'Type your answer and press Enter or click Submit'
                  : 'Answer the question to continue'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}