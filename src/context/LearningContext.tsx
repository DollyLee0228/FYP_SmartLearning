import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EnglishLevel, UserProgress, LearningStreak } from '@/types/learning';
import { useAuth } from '@/hooks/useAuth';
import { getUserProgress } from '@/utils/progressTracking';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface LearningContextType {
  hasCompletedAssessment: boolean;
  userProgress: UserProgress | null;
  setUserLevel: (level: EnglishLevel, score: number) => void;
  updateStreak: () => void;
  resetProgress: () => void;
  refreshProgress: () => Promise<void>; // ✅ 新增：手动刷新
}

const defaultStreak: LearningStreak = {
  current: 0,
  longest: 0,
  lastActiveDate: '',
};

const defaultProgress: UserProgress = {
  level: 'A1',
  xp: 0,
  totalLessons: 99, // ✅ 更新为实际总数
  completedLessons: 0,
  streak: defaultStreak,
  weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
  moduleProgress: {},
};

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export function LearningProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth(); // ✅ 获取当前用户
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  // ✅ 从Firebase实时监听用户进度
  useEffect(() => {
    if (!user) {
      // 用户未登录 - 使用localStorage作为fallback
      console.log('📭 No user logged in, using localStorage');
      const savedProgress = localStorage.getItem('smartlearning_progress');
      const savedAssessment = localStorage.getItem('smartlearning_assessment');
      
      if (savedProgress) {
        try {
          setUserProgress(JSON.parse(savedProgress));
        } catch (error) {
          console.error('Error parsing saved progress:', error);
        }
      }
      if (savedAssessment === 'completed') {
        setHasCompletedAssessment(true);
      }
      setIsLoadingProgress(false);
      return;
    }

    console.log('👤 User logged in, loading progress from Firebase:', user.uid);
    setIsLoadingProgress(true);

    // ✅ 实时监听Firebase的userProgress文档
    const unsubscribe = onSnapshot(
      doc(db, 'userProgress', user.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          console.log('✅ Progress loaded from Firebase:', data);

          // ✅ 转换Firebase数据格式到UserProgress格式
          const firebaseProgress: UserProgress = {
            level: (data.level || 'A1') as EnglishLevel,
            xp: data.xp || 0,
            totalLessons: 99, // 固定总数
            completedLessons: data.totalLessonsCompleted || 0,
            streak: data.streak || defaultStreak,
            weeklyProgress: data.weeklyProgress || [0, 0, 0, 0, 0, 0, 0],
            moduleProgress: convertModuleProgress(data.moduleProgress || {}),
          };

          setUserProgress(firebaseProgress);
          setHasCompletedAssessment(true);

          // ✅ 同时保存到localStorage作为缓存
          localStorage.setItem('smartlearning_progress', JSON.stringify(firebaseProgress));
          localStorage.setItem('smartlearning_assessment', 'completed');
        } else {
          console.log('⚠️ No progress found in Firebase, using default');
          setUserProgress(defaultProgress);
          setHasCompletedAssessment(false);
        }
        setIsLoadingProgress(false);
      },
      (error) => {
        console.error('❌ Error loading progress from Firebase:', error);
        // Fallback to localStorage
        const savedProgress = localStorage.getItem('smartlearning_progress');
        if (savedProgress) {
          try {
            setUserProgress(JSON.parse(savedProgress));
          } catch (e) {
            console.error('Error parsing cached progress:', e);
          }
        }
        setIsLoadingProgress(false);
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, [user]);

  // ✅ 转换Firebase的moduleProgress格式到UI需要的格式
  function convertModuleProgress(firebaseModuleProgress: any): Record<string, number> {
    const result: Record<string, number> = {};
    
    if (!firebaseModuleProgress) return result;

    for (const [moduleId, data] of Object.entries(firebaseModuleProgress)) {
      const moduleData = data as any;
      result[moduleId] = moduleData.percentage || 0;
    }

    return result;
  }

  // ✅ 手动刷新进度（用于保存后立即更新UI）
  const refreshProgress = async () => {
    if (!user) return;

    try {
      console.log('🔄 Manually refreshing progress...');
      const progress = await getUserProgress(user.uid);
      
      if (progress) {
        const uiProgress: UserProgress = {
          level: (progress.level || 'A1') as EnglishLevel,
          xp: progress.xp || 0,
          totalLessons: 99,
          completedLessons: progress.totalLessonsCompleted || 0,
          streak: progress.streak || defaultStreak,
          weeklyProgress: [0, 0, 0, 0, 0, 0, 0], // TODO: 如果需要可以计算
          moduleProgress: convertModuleProgress(progress.moduleProgress || {}),
        };

        setUserProgress(uiProgress);
        localStorage.setItem('smartlearning_progress', JSON.stringify(uiProgress));
      }
    } catch (error) {
      console.error('Error refreshing progress:', error);
    }
  };

  const setUserLevel = (level: EnglishLevel, score: number) => {
    const today = new Date().toISOString().split('T')[0];
    const newProgress: UserProgress = {
      ...defaultProgress,
      level,
      xp: score * 10,
      streak: {
        current: 1,
        longest: 1,
        lastActiveDate: today,
      },
      weeklyProgress: [score * 2, 0, 0, 0, 0, 0, 0],
      moduleProgress: {
        grammar: 0,
        vocabulary: 0,
        reading: 0,
        listening: 0,
        writing: 0,
        speaking: 0,
      },
      completedLessons: 0,
    };
    
    setUserProgress(newProgress);
    setHasCompletedAssessment(true);
    localStorage.setItem('smartlearning_progress', JSON.stringify(newProgress));
    localStorage.setItem('smartlearning_assessment', 'completed');

    // ✅ TODO: 如果需要，也保存到Firebase
    // if (user) {
    //   await setDoc(doc(db, 'userProgress', user.uid), { level, xp: score * 10, ... });
    // }
  };

  const updateStreak = () => {
    if (!userProgress) return;
    
    const today = new Date().toISOString().split('T')[0];
    const lastActive = userProgress.streak.lastActiveDate;
    
    if (lastActive === today) return;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let newStreak = 1;
    if (lastActive === yesterdayStr) {
      newStreak = userProgress.streak.current + 1;
    }
    
    const updatedProgress: UserProgress = {
      ...userProgress,
      streak: {
        current: newStreak,
        longest: Math.max(newStreak, userProgress.streak.longest),
        lastActiveDate: today,
      },
    };
    
    setUserProgress(updatedProgress);
    localStorage.setItem('smartlearning_progress', JSON.stringify(updatedProgress));
  };

  const resetProgress = () => {
    setUserProgress(null);
    setHasCompletedAssessment(false);
    localStorage.removeItem('smartlearning_progress');
    localStorage.removeItem('smartlearning_assessment');
    
    // ✅ TODO: 如果需要，也清除Firebase数据
  };

  return (
    <LearningContext.Provider 
      value={{
        hasCompletedAssessment,
        userProgress: isLoadingProgress ? null : userProgress,
        setUserLevel,
        updateStreak,
        resetProgress,
        refreshProgress,
      }}
    >
      {children}
    </LearningContext.Provider>
  );
}

export function useLearning() {
  const context = useContext(LearningContext);
  if (context === undefined) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
}