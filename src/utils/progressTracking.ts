// 📁 src/utils/progressTracking.ts

import { doc, setDoc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface LessonProgressData {
  userId: string;
  lessonId: string;
  moduleId: string;
  completed: boolean;
  score?: number; // Exercise score (e.g., 4/5 = 80%)
  totalQuestions?: number;
  correctAnswers?: number;
  timeSpent?: number; // in seconds
  completedAt: Date;
}

export interface UserProgressData {
  userId: string;
  level: string;
  xp: number;
  totalLessonsCompleted: number;
  completedLessons: string[]; // Array of lesson IDs
  moduleProgress: {
    [moduleId: string]: {
      completedLessons: number;
      totalLessons: number;
      percentage: number;
    };
  };
  streak: {
    current: number;
    longest: number;
    lastActiveDate: string;
  };
  lastUpdated: Date;
}

/**
 * Save lesson completion to Firebase
 * Creates/updates both lesson progress and user progress
 */
export async function saveLessonProgress(data: LessonProgressData): Promise<boolean> {
  try {
    const { userId, lessonId, moduleId, completed, score, totalQuestions, correctAnswers, timeSpent } = data;

    console.log('💾 Saving lesson progress:', { userId, lessonId, moduleId, completed });

    // 1. Save individual lesson progress
    const lessonProgressRef = doc(db, 'userProgress', userId, 'lessons', lessonId);
    await setDoc(lessonProgressRef, {
      lessonId,
      moduleId,
      completed,
      score: score || null,
      totalQuestions: totalQuestions || null,
      correctAnswers: correctAnswers || null,
      timeSpent: timeSpent || null,
      completedAt: serverTimestamp(),
      lastAttempt: serverTimestamp(),
    }, { merge: true });

    console.log('✅ Lesson progress saved');

    // 2. Update user's overall progress
    const userProgressRef = doc(db, 'userProgress', userId);
    const userProgressSnap = await getDoc(userProgressRef);

    if (!userProgressSnap.exists()) {
      // Create new user progress document
      await setDoc(userProgressRef, {
        userId,
        level: 'A1',
        xp: 0,
        totalLessonsCompleted: 0,
        completedLessons: [],
        moduleProgress: {},
        streak: {
          current: 0,
          longest: 0,
          lastActiveDate: '',
        },
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      console.log('✅ Created new user progress document');
    }

    // 3. Get current progress data
    const currentProgress = userProgressSnap.exists() ? userProgressSnap.data() : {};
    const completedLessonsArray = currentProgress.completedLessons || [];
    const isNewCompletion = !completedLessonsArray.includes(lessonId);

    // 4. Calculate XP reward (only for new completions)
    let xpToAdd = 0;
    if (completed && isNewCompletion) {
      xpToAdd = 50; // Base XP
      if (score) {
        xpToAdd += Math.round(score * 10); // Bonus XP based on score
      }
    }

    // 5. Update streak
    const today = new Date().toISOString().split('T')[0];
    const lastActiveDate = currentProgress.streak?.lastActiveDate || '';
    let newStreak = currentProgress.streak?.current || 0;
    let longestStreak = currentProgress.streak?.longest || 0;

    if (lastActiveDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastActiveDate === yesterdayStr) {
        newStreak += 1; // Continue streak
      } else if (lastActiveDate === '') {
        newStreak = 1; // Start new streak
      } else {
        newStreak = 1; // Reset streak
      }

      if (newStreak > longestStreak) {
        longestStreak = newStreak;
      }
    }

    // 6. Update module progress
    const moduleProgressData = currentProgress.moduleProgress || {};
    const currentModuleProgress = moduleProgressData[moduleId] || {
      completedLessons: 0,
      totalLessons: 30, // Default, should be fetched from modules collection
      percentage: 0,
    };

    if (isNewCompletion) {
      currentModuleProgress.completedLessons += 1;
      currentModuleProgress.percentage = Math.round(
        (currentModuleProgress.completedLessons / currentModuleProgress.totalLessons) * 100
      );
    }

    moduleProgressData[moduleId] = currentModuleProgress;

    // 7. Update user progress document
    const updateData: any = {
      lastUpdated: serverTimestamp(),
      streak: {
        current: newStreak,
        longest: longestStreak,
        lastActiveDate: today,
      },
      moduleProgress: moduleProgressData,
    };

    if (isNewCompletion) {
      updateData.completedLessons = [...completedLessonsArray, lessonId];
      updateData.totalLessonsCompleted = increment(1);
    }

    if (xpToAdd > 0) {
      updateData.xp = increment(xpToAdd);
    }

    await updateDoc(userProgressRef, updateData);

    console.log('✅ User progress updated:', {
      xpAdded: xpToAdd,
      newStreak,
      moduleProgress: currentModuleProgress,
    });

    return true;
  } catch (error) {
    console.error('❌ Error saving lesson progress:', error);
    return false;
  }
}

/**
 * Get user's progress for a specific lesson
 */
export async function getLessonProgress(
  userId: string,
  lessonId: string
): Promise<any | null> {
  try {
    const lessonProgressRef = doc(db, 'userProgress', userId, 'lessons', lessonId);
    const snap = await getDoc(lessonProgressRef);
    
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting lesson progress:', error);
    return null;
  }
}

/**
 * Get user's overall progress
 */
export async function getUserProgress(userId: string): Promise<UserProgressData | null> {
  try {
    const userProgressRef = doc(db, 'userProgress', userId);
    const snap = await getDoc(userProgressRef);
    
    if (snap.exists()) {
      return snap.data() as UserProgressData;
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting user progress:', error);
    return null;
  }
}

/**
 * Check if lesson is completed
 */
export async function isLessonCompleted(
  userId: string,
  lessonId: string
): Promise<boolean> {
  try {
    const progress = await getLessonProgress(userId, lessonId);
    return progress?.completed || false;
  } catch (error) {
    console.error('❌ Error checking lesson completion:', error);
    return false;
  }
}