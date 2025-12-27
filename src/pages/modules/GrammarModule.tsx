import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Play, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { collection, query, where, orderBy, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function GrammarModule() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [module, setModule] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ 实时监听user progress
  useEffect(() => {
    if (!user) {
      setCompletedLessons([]);
      return;
    }

    console.log('👂 Setting up real-time listener for user progress...');
    
    const userProgressRef = doc(db, 'userProgress', user.uid);
    const unsubscribe = onSnapshot(
      userProgressRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const progressData = snapshot.data();
          const completed = progressData.completedLessons || [];
          console.log('🔄 Progress updated! Completed lessons:', completed);
          setCompletedLessons(completed);
        } else {
          console.log('📭 No progress data yet');
          setCompletedLessons([]);
        }
      },
      (error) => {
        console.error('❌ Error listening to progress:', error);
      }
    );

    return () => {
      console.log('🔇 Unsubscribing from progress listener');
      unsubscribe();
    };
  }, [user]);

  // ✅ 加载module和lessons
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        console.log('🔍 Fetching grammar module data from Firebase...');

        // 1. Fetch module data
        const moduleRef = doc(db, 'modules', 'grammar');
        const moduleSnap = await getDoc(moduleRef);
        
        if (moduleSnap.exists()) {
          const moduleData = { id: moduleSnap.id, ...moduleSnap.data() };
          setModule(moduleData);
          console.log('✅ Module loaded:', moduleData);
        } else {
          console.error('❌ Grammar module not found in Firebase');
          toast.error('Grammar module not found');
        }

        // 2. Fetch lessons
        const lessonsQuery = query(
          collection(db, 'lessons'),
          where('moduleId', '==', 'grammar'),
          orderBy('order')
        );
        
        const lessonsSnapshot = await getDocs(lessonsQuery);
        const lessonsData = lessonsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setLessons(lessonsData);
        console.log('✅ Lessons loaded:', lessonsData.length, 'lessons');

        // 3. Fetch initial progress
        if (user) {
          const userProgressRef = doc(db, 'userProgress', user.uid);
          const userProgressSnap = await getDoc(userProgressRef);
          
          if (userProgressSnap.exists()) {
            const progressData = userProgressSnap.data();
            setCompletedLessons(progressData.completedLessons || []);
            console.log('✅ Initial completed lessons:', progressData.completedLessons);
          }
        }

      } catch (error: any) {
        console.error('❌ Error fetching data:', error);
        toast.error('Failed to load grammar module');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  // ✅ 计算每个lesson是否解锁 (Sequential unlock logic)
  const getLessonStatus = (lesson: any, index: number) => {
    const isCompleted = completedLessons.includes(lesson.id);
    
    // 第一个lesson永远解锁
    if (index === 0) {
      return {
        isCompleted,
        isLocked: false,
        canStart: lesson.hasContent,
        lockReason: null
      };
    }
    
    // 检查上一个lesson是否完成
    const previousLesson = lessons[index - 1];
    const isPreviousCompleted = completedLessons.includes(previousLesson.id);
    
    // 如果上一个lesson没完成，这个lesson就锁住
    if (!isPreviousCompleted) {
      return {
        isCompleted,
        isLocked: true,
        canStart: false,
        lockReason: `Complete "${previousLesson.title}" first`
      };
    }
    
    // 上一个完成了，这个解锁
    return {
      isCompleted,
      isLocked: false,
      canStart: lesson.hasContent,
      lockReason: null
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] text-white flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mb-4" />
        <p className="text-gray-400">Loading Grammar Module...</p>
      </div>
    );
  }

  // Error state
  if (!module) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] text-white flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl mb-4">Module not found</h2>
          <Button onClick={() => navigate('/dashboard')} className="bg-cyan-500">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // 计算进度
  const completedCount = lessons.filter(l => completedLessons.includes(l.id)).length;
  const progress = lessons.length > 0 
    ? Math.round((completedCount / lessons.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Header */}
      <div className="bg-[#111827] border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shrink-0">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold mb-2">{module.title}</h1>
              <p className="text-gray-400 mb-4">{module.description}</p>
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-xs">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">
                      {completedCount} of {lessons.length} lessons
                    </span>
                    <span className="text-cyan-400 font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-lg font-semibold mb-6">Lessons</h2>
        
        {lessons.length === 0 ? (
          <div className="bg-[#111827] rounded-xl border border-white/10 p-8 text-center">
            <p className="text-gray-400">No lessons available yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, index) => {
              const status = getLessonStatus(lesson, index);
              const { isCompleted, isLocked, canStart, lockReason } = status;
              
              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    if (isLocked) {
                      toast.info(lockReason || 'Complete previous lessons to unlock');
                    } else if (!canStart) {
                      toast.info('This lesson content is coming soon!');
                    } else {
                      navigate(`/lesson/grammar/${lesson.id}`);
                    }
                  }}
                  className={`bg-[#111827] rounded-xl border border-white/10 p-4 flex items-center gap-4 transition-all ${
                    isLocked 
                      ? 'opacity-50 cursor-not-allowed' 
                      : canStart
                      ? 'hover:border-white/20 hover:shadow-lg cursor-pointer'
                      : 'cursor-default'
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isLocked
                      ? 'bg-white/5 text-gray-600'
                      : 'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isLocked ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-semibold">{lesson.order}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className={`font-medium ${isLocked ? 'text-gray-500' : 'text-white'}`}>
                      {lesson.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-gray-500">{lesson.duration}</p>
                      {lesson.difficulty && !isLocked && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          lesson.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                          lesson.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {lesson.difficulty}
                        </span>
                      )}
                      {lesson.requiredLevel && !isLocked && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
                          {lesson.requiredLevel}
                        </span>
                      )}
                      {isLocked && lockReason && (
                        <span className="text-xs text-gray-600 italic">
                          🔒 {lockReason}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Button */}
                  <div>
                    {!isLocked && !isCompleted && canStart && (
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/lesson/grammar/${lesson.id}`);
                        }}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    )}
                    
                    {!isLocked && !isCompleted && !canStart && (
                      <span className="text-xs text-gray-500 px-3">Coming soon</span>
                    )}
                    
                    {isCompleted && canStart && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/lesson/grammar/${lesson.id}`);
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    )}
                    
                    {isCompleted && !canStart && (
                      <span className="text-xs text-emerald-400 px-3">
                        <CheckCircle2 className="w-3 h-3 inline mr-1" />
                        Completed
                      </span>
                    )}
                    
                    {isLocked && (
                      <span className="text-xs text-gray-600 px-3 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Locked
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}