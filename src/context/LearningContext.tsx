import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/hooks/useAuth';
import { EnglishLevel, UserProgress, LearningStreak } from '@/types/learning';

interface LearningContextType {
  hasCompletedAssessment: boolean;
  userProgress: UserProgress | null;
  setUserLevel: (level: EnglishLevel, score: number) => void;
  updateStreak: () => void;
  resetProgress: () => void;
  loading: boolean;
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

const LearningContext = createContext(undefined);

export function LearningProvider({ children }: { children: ReactNode }) {
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Fetch user progress from Firestore
      fetchUserProgress(user.uid);
    } else {
      // Fall back to localStorage for non-authenticated users
      const savedProgress = localStorage.getItem('smartlearning_progress');
      const savedAssessment = localStorage.getItem('smartlearning_assessment');
      
      if (savedProgress) {
        setUserProgress(JSON.parse(savedProgress));
      }
      if (savedAssessment === 'completed') {
        setHasCompletedAssessment(true);
      }
      setLoading(false);
    }
  }, [user]);

  const fetchUserProgress = async (userId: string) => {
    try {
      const progressDoc = await getDoc(doc(db, 'userProgress', userId));
      
      if (progressDoc.exists()) {
        const data = progressDoc.data() as UserProgress;
        setUserProgress(data);
        setHasCompletedAssessment(true);
      } else {
        // No progress yet, check localStorage
        const savedProgress = localStorage.getItem('smartlearning_progress');
        if (savedProgress) {
          setUserProgress(JSON.parse(savedProgress));
        }
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const setUserLevel = async (level: EnglishLevel, score: number) => {
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

    // Save to Firestore if user is logged in
    if (user) {
      try {
        await setDoc(doc(db, 'userProgress', user.uid), newProgress);
        
        // Also update user's English level
        await updateDoc(doc(db, 'users', user.uid), {
          englishLevel: level,
          lastActive: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error saving progress to Firestore:', error);
      }
    }
  };

  const updateStreak = async () => {
    if (!userProgress) return;
    
    const today = new Date().toISOString().split('T')[0];
    const lastActive = userProgress.streak.lastActiveDate;
    
    if (lastActive === today) return;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const newStreak = {
      current: lastActive === yesterdayStr ? userProgress.streak.current + 1 : 1,
      longest: Math.max(
        userProgress.streak.longest,
        lastActive === yesterdayStr ? userProgress.streak.current + 1 : 1
      ),
      lastActiveDate: today,
    };
    
    const updatedProgress = { ...userProgress, streak: newStreak };
    setUserProgress(updatedProgress);
    localStorage.setItem('smartlearning_progress', JSON.stringify(updatedProgress));

    // Update Firestore
    if (user) {
      try {
        await updateDoc(doc(db, 'userProgress', user.uid), { streak: newStreak });
        await updateDoc(doc(db, 'users', user.uid), { lastActive: new Date().toISOString() });
      } catch (error) {
        console.error('Error updating streak:', error);
      }
    }
  };

  const resetProgress = async () => {
    setUserProgress(defaultProgress);
    setHasCompletedAssessment(false);
    localStorage.removeItem('smartlearning_progress');
    localStorage.removeItem('smartlearning_assessment');

    // Delete from Firestore
    if (user) {
      try {
        await setDoc(doc(db, 'userProgress', user.uid), defaultProgress);
      } catch (error) {
        console.error('Error resetting progress:', error);
      }
    }
  };

  return (
    
      {children}
    
  );
}

export function useLearning() {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within LearningProvider');
  }
  return context;
}