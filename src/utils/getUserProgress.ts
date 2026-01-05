// getUserProgress.ts - 获取用户真实进度
// 放在 src/utils/ 文件夹

import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface UserProgress {
  lessonsCompleted: number;
  perfectScores: number;
  avgScore: number;
  moduleProgress: Record<string, number>;
  currentStreak: number;
  videosWatched: number;
}

export async function getUserProgress(userId: string): Promise<UserProgress> {
  try {
    // 1. 获取completed lessons
    const userProgressRef = doc(db, 'userProgress', userId);
    const userProgressSnap = await getDoc(userProgressRef);
    const completedLessons = userProgressSnap.exists() 
      ? userProgressSnap.data().completedLessons || []
      : [];

    // 2. 获取所有lesson progress (for scores)
    const progressRef = collection(db, 'users', userId, 'progress');
    const progressSnapshot = await getDocs(progressRef);
    
    const progressData = progressSnapshot.docs.map(doc => doc.data());
    
    // 3. 计算统计
    const totalLessons = completedLessons.length;
    const perfectScores = progressData.filter(p => p.score === 100).length;
    const avgScore = progressData.length > 0
      ? Math.round(progressData.reduce((sum, p) => sum + (p.score || 0), 0) / progressData.length)
      : 0;

    // 4. 按module分组
    const moduleProgress: Record<string, number> = {};
    for (const lessonId of completedLessons) {
      const parts = lessonId.split('-');
      if (parts.length >= 2) {
        const moduleId = parts[0];
        moduleProgress[moduleId] = (moduleProgress[moduleId] || 0) + 1;
      }
    }

    // 5. TODO: 获取streak (暂时返回0)
    const currentStreak = 0;

    // 6. TODO: 获取videos watched (暂时返回0)
    const videosWatched = 0;

    return {
      lessonsCompleted: totalLessons,
      perfectScores,
      avgScore,
      moduleProgress,
      currentStreak,
      videosWatched,
    };
  } catch (error) {
    console.error('Error getting user progress:', error);
    return {
      lessonsCompleted: 0,
      perfectScores: 0,
      avgScore: 0,
      moduleProgress: {},
      currentStreak: 0,
      videosWatched: 0,
    };
  }
}

// 计算单个achievement的进度
export function calculateAchievementProgress(
  achievement: any,
  userProgress: UserProgress
): { current: number; total: number } {
  const req = achievement.requirement;

  switch (req.type) {
    case 'lessons_completed':
      return {
        current: Math.min(userProgress.lessonsCompleted, req.count),
        total: req.count
      };

    case 'module_lessons':
      const moduleCount = userProgress.moduleProgress[req.moduleId] || 0;
      return {
        current: Math.min(moduleCount, req.count),
        total: req.count
      };

    case 'perfect_scores':
      return {
        current: Math.min(userProgress.perfectScores, req.count),
        total: req.count
      };

    case 'average_score':
      return {
        current: userProgress.avgScore,
        total: req.score
      };

    case 'streak':
      return {
        current: Math.min(userProgress.currentStreak, req.days),
        total: req.days
      };

    case 'videos_watched':
      return {
        current: Math.min(userProgress.videosWatched, req.count),
        total: req.count
      };

    case 'module_completed':
      // Check if module is completed
      const moduleLessonsCount = userProgress.moduleProgress[req.moduleId] || 0;
      // TODO: Need to know total lessons in module
      return {
        current: moduleLessonsCount,
        total: 10 // Placeholder
      };

    case 'all_modules':
      const completedModules = Object.keys(userProgress.moduleProgress).length;
      return {
        current: Math.min(completedModules, req.count),
        total: req.count
      };

    case 'time_of_day':
      // Special case - can't show progress
      return { current: 0, total: 1 };

    default:
      return { current: 0, total: 1 };
  }
}