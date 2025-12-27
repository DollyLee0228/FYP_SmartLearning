import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Library, Play, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function VocabularyModule() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [module, setModule] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        console.log('🔍 Fetching vocabulary module data from Firebase...');

        // 1. Fetch module data
        const moduleRef = doc(db, 'modules', 'vocabulary');
        const moduleSnap = await getDoc(moduleRef);
        
        if (moduleSnap.exists()) {
          const moduleData = { id: moduleSnap.id, ...moduleSnap.data() };
          setModule(moduleData);
          console.log('✅ Module loaded:', moduleData);
        } else {
          console.error('❌ Vocabulary module not found in Firebase');
          toast.error('Vocabulary module not found');
        }

        // 2. Fetch lessons for vocabulary module
        const lessonsQuery = query(
          collection(db, 'lessons'),
          where('moduleId', '==', 'vocabulary'),
          orderBy('order')
        );
        
        const lessonsSnapshot = await getDocs(lessonsQuery);
        const lessonsData = lessonsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setLessons(lessonsData);
        console.log('✅ Lessons loaded:', lessonsData.length, 'lessons');

        // 3. 获取用户完成状态
        if (user) {
          console.log('👤 Fetching user progress for:', user.uid);
          
          const userProgressRef = doc(db, 'userProgress', user.uid);
          const userProgressSnap = await getDoc(userProgressRef);
          
          if (userProgressSnap.exists()) {
            const progressData = userProgressSnap.data();
            const completed = progressData.completedLessons || [];
            setCompletedLessons(completed);
            console.log('✅ Completed lessons:', completed);
          } else {
            console.log('⚠️ No user progress found');
            setCompletedLessons([]);
          }
        } else {
          console.log('📭 User not logged in');
          setCompletedLessons([]);
        }

      } catch (error: any) {
        console.error('❌ Error fetching data:', error);
        toast.error('Failed to load vocabulary module');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] text-white flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-400 mb-4" />
        <p className="text-gray-400">Loading Vocabulary Module...</p>
      </div>
    );
  }

  // Error state
  if (!module) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] text-white flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl mb-4">Module not found</h2>
          <Button onClick={() => navigate('/dashboard')} className="bg-purple-500">
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shrink-0">
              <Library className="w-8 h-8 text-white" />
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
                    <span className="text-purple-400 font-medium">{progress}%</span>
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
            <p className="text-sm text-gray-500 mt-2">Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, index) => {
              const isCompleted = completedLessons.includes(lesson.id);
              
              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    if (!lesson.isLocked && lesson.hasContent) {
                      navigate(`/lesson/vocabulary/${lesson.id}`);
                    } else if (lesson.isLocked) {
                      toast.info('Complete previous lessons to unlock this one');
                    } else {
                      toast.info('This lesson content is coming soon!');
                    }
                  }}
                  className={`bg-[#111827] rounded-xl border border-white/10 p-4 flex items-center gap-4 transition-all ${
                    lesson.isLocked 
                      ? 'opacity-50 cursor-not-allowed' 
                      : lesson.hasContent
                      ? 'hover:border-white/20 hover:shadow-lg cursor-pointer'
                      : 'cursor-default'
                  }`}
                >
                  {/* Lesson Number/Status Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : lesson.isLocked
                      ? 'bg-white/5 text-gray-500'
                      : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : lesson.isLocked ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-semibold">{lesson.order}</span>
                    )}
                  </div>

                  {/* Lesson Info */}
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{lesson.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-gray-500">{lesson.duration}</p>
                      {lesson.difficulty && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          lesson.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                          lesson.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {lesson.difficulty}
                        </span>
                      )}
                      {lesson.requiredLevel && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                          {lesson.requiredLevel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div>
                    {!lesson.isLocked && !isCompleted && lesson.hasContent && (
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/lesson/vocabulary/${lesson.id}`);
                        }}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    )}
                    
                    {!lesson.isLocked && !isCompleted && !lesson.hasContent && (
                      <span className="text-xs text-gray-500 px-3">Coming soon</span>
                    )}
                    
                    {isCompleted && lesson.hasContent && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/lesson/vocabulary/${lesson.id}`);
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    )}
                    
                    {isCompleted && !lesson.hasContent && (
                      <span className="text-xs text-emerald-400 px-3">
                        <CheckCircle2 className="w-3 h-3 inline mr-1" />
                        Completed
                      </span>
                    )}
                    
                    {lesson.isLocked && (
                      <span className="text-xs text-gray-600 px-3">Locked</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Debug Info */}
        <details className="mt-8 p-4 bg-gray-900 rounded text-xs">
          <summary className="cursor-pointer text-gray-500 mb-2">
            🐛 Debug Info (Remove this in production)
          </summary>
          <div className="space-y-2 text-gray-400">
            <p>Module ID: {module?.id}</p>
            <p>Module Title: {module?.title}</p>
            <p>Lessons Count: {lessons.length}</p>
            <p>Completed: {completedCount}</p>
            <p>Progress: {progress}%</p>
            <p>User ID: {user?.uid || 'Not logged in'}</p>
            <p>Completed Lessons: {JSON.stringify(completedLessons)}</p>
          </div>
        </details>
      </div>
    </div>
  );
}