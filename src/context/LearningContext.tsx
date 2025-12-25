import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EnglishLevel, UserProgress, LearningStreak } from '@/types/learning';

interface LearningContextType {
  hasCompletedAssessment: boolean;
  userProgress: UserProgress | null;
  setUserLevel: (level: EnglishLevel, score: number) => void;
  updateStreak: () => void;
  resetProgress: () => void;
}

const defaultStreak: LearningStreak = {
  current: 0,
  longest: 0,
  lastActiveDate: '',
};

const defaultProgress: UserProgress = {
  level: 'A1',
  xp: 0,
  totalLessons: 130,
  completedLessons: 0,
  streak: defaultStreak,
  weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
  moduleProgress: {},
};

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export function LearningProvider({ children }: { children: ReactNode }) {
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    // Check localStorage for existing progress
    const savedProgress = localStorage.getItem('smartlearning_progress');
    const savedAssessment = localStorage.getItem('smartlearning_assessment');
    
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
    if (savedAssessment === 'completed') {
      setHasCompletedAssessment(true);
    }
  }, []);

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
        grammar: 33,
        vocabulary: 40,
        reading: 25,
        listening: 39,
        writing: 19,
        speaking: 18,
      },
      completedLessons: 39,
    };
    
    setUserProgress(newProgress);
    setHasCompletedAssessment(true);
    localStorage.setItem('smartlearning_progress', JSON.stringify(newProgress));
    localStorage.setItem('smartlearning_assessment', 'completed');
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
  };

  return (
    <LearningContext.Provider value={{
      hasCompletedAssessment,
      userProgress,
      setUserLevel,
      updateStreak,
      resetProgress,
    }}>
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
