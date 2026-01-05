// checkAchievements.ts - 修复版本

import { collection, getDocs, doc, getDoc, setDoc, updateDoc, Timestamp, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';

// ✅ 定义Achievement类型
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  category: string;
  rarity: string;
  requirement: {
    type: string;
    count?: number;
    moduleId?: string;
    score?: number;
    days?: number;
    [key: string]: any;
  };
}

// ✅ 定义Stats类型
interface UserStats {
  lessonsCompleted: number;
  perfectScores: number;
  avgScore: number;
  moduleProgress: Record<string, number>;
  modulesCompleted: Record<string, boolean>;
  currentStreak: number;
  videosWatched: number;
}

// ✅ 获取用户统计数据
async function getUserStats(userId: string): Promise<UserStats> {
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
    
    // 计算统计
    const totalLessons = completedLessons.length;
    const perfectScores = progressData.filter(p => p.score === 100).length;
    const avgScore = progressData.length > 0
      ? Math.round(progressData.reduce((sum, p) => sum + (p.score || 0), 0) / progressData.length)
      : 0;

    // 按module分组
    const moduleProgress: Record<string, number> = {};
    for (const lessonId of completedLessons) {
      // lessonId格式: grammar-lesson-1, vocabulary-lesson-1
      const parts = lessonId.split('-');
      if (parts.length >= 2) {
        const moduleId = parts[0];
        moduleProgress[moduleId] = (moduleProgress[moduleId] || 0) + 1;
      }
    }

    // 检查module是否完成
    const modulesCompleted: Record<string, boolean> = {};
    const modules = ['grammar', 'vocabulary', 'reading', 'listening', 'writing', 'speaking'];
    
    for (const moduleId of modules) {
      const lessonsQuery = query(
        collection(db, 'lessons'),
        where('moduleId', '==', moduleId)
      );
      const lessonsSnapshot = await getDocs(lessonsQuery);
      const totalModuleLessons = lessonsSnapshot.size;
      
      modulesCompleted[moduleId] = totalModuleLessons > 0 && (moduleProgress[moduleId] || 0) >= totalModuleLessons;
    }

    return {
      lessonsCompleted: totalLessons,
      perfectScores,
      avgScore,
      moduleProgress,
      modulesCompleted,
      currentStreak: 0, // TODO: 实现streak计算
      videosWatched: 0, // TODO: 实现video tracking
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      lessonsCompleted: 0,
      perfectScores: 0,
      avgScore: 0,
      moduleProgress: {},
      modulesCompleted: {},
      currentStreak: 0,
      videosWatched: 0,
    };
  }
}

// ✅ 检查requirement是否满足
function checkRequirement(requirement: Achievement['requirement'], stats: UserStats): boolean {
  try {
    switch (requirement.type) {
      case 'lessons_completed':
        return stats.lessonsCompleted >= (requirement.count || 0);
      
      case 'module_lessons':
        return (stats.moduleProgress[requirement.moduleId || ''] || 0) >= (requirement.count || 0);
      
      case 'module_completed':
        return stats.modulesCompleted[requirement.moduleId || ''] === true;
      
      case 'perfect_scores':
        return stats.perfectScores >= (requirement.count || 0);
      
      case 'average_score':
        return stats.avgScore >= (requirement.score || 0);
      
      case 'streak':
        return stats.currentStreak >= (requirement.days || 0);
      
      case 'videos_watched':
        return stats.videosWatched >= (requirement.count || 0);
      
      case 'all_modules':
        const completedModules = Object.values(stats.modulesCompleted).filter(Boolean).length;
        return completedModules >= (requirement.count || 0);
      
      default:
        console.warn(`Unknown requirement type: ${requirement.type}`);
        return false;
    }
  } catch (error) {
    console.error('Error checking requirement:', error);
    return false;
  }
}

// ✅ 解锁achievement
async function unlockAchievement(userId: string, achievement: Achievement): Promise<boolean> {
  try {
    console.log(`🏆 Unlocking achievement: ${achievement.title}`);
    
    // 保存到 users/{userId}/achievements/{achievementId}
    const achievementRef = doc(db, 'users', userId, 'achievements', achievement.id);
    await setDoc(achievementRef, {
      achievementId: achievement.id,
      title: achievement.title,
      points: achievement.points,
      unlockedAt: Timestamp.now()
    });

    // 更新用户总积分
    const statsRef = doc(db, 'users', userId, 'stats', 'overall');
    const statsSnap = await getDoc(statsRef);
    
    if (statsSnap.exists()) {
      const currentPoints = statsSnap.data().totalPoints || 0;
      const currentAchievements = statsSnap.data().achievementsUnlocked || 0;
      
      await updateDoc(statsRef, {
        totalPoints: currentPoints + achievement.points,
        achievementsUnlocked: currentAchievements + 1
      });
    } else {
      await setDoc(statsRef, {
        totalPoints: achievement.points,
        achievementsUnlocked: 1,
        lessonsCompleted: 0,
        perfectScores: 0
      });
    }

    console.log(`✅ Achievement unlocked: ${achievement.title} (+${achievement.points} points)`);
    return true;
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    return false;
  }
}

// ✅ 主函数：检查所有achievements
export async function checkAchievements(userId: string): Promise<Achievement[]> {
  try {
    console.log('🔍 Checking achievements for user:', userId);
    
    // 1. 获取所有achievements
    const achievementsSnapshot = await getDocs(collection(db, 'achievements'));
    const allAchievements = achievementsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Achievement[];

    // 2. 获取用户已解锁的achievements
    const userAchievementsSnapshot = await getDocs(
      collection(db, 'users', userId, 'achievements')
    );
    const unlockedIds = userAchievementsSnapshot.docs.map(doc => doc.data().achievementId);

    // 3. 获取用户统计
    const stats = await getUserStats(userId);
    console.log('📊 User stats:', stats);

    // 4. 检查每个未解锁的achievement
    const newlyUnlocked: Achievement[] = [];
    
    for (const achievement of allAchievements) {
      // 跳过已解锁的
      if (unlockedIds.includes(achievement.id)) {
        continue;
      }

      // 检查是否满足条件
      const isUnlocked = checkRequirement(achievement.requirement, stats);
      
      if (isUnlocked) {
        const success = await unlockAchievement(userId, achievement);
        if (success) {
          newlyUnlocked.push(achievement);
        }
      }
    }

    console.log(`🎉 Unlocked ${newlyUnlocked.length} new achievements!`);
    return newlyUnlocked;
  } catch (error) {
    console.error('❌ Error checking achievements:', error);
    return [];
  }
}

// ✅ 获取用户的总积分和成就数
export async function getUserAchievementsSummary(userId: string): Promise<{ totalPoints: number; achievementsUnlocked: number }> {
  try {
    const statsRef = doc(db, 'users', userId, 'stats', 'overall');
    const statsSnap = await getDoc(statsRef);
    
    if (statsSnap.exists()) {
      return {
        totalPoints: statsSnap.data().totalPoints || 0,
        achievementsUnlocked: statsSnap.data().achievementsUnlocked || 0
      };
    }
    
    return { totalPoints: 0, achievementsUnlocked: 0 };
  } catch (error) {
    console.error('Error getting achievements summary:', error);
    return { totalPoints: 0, achievementsUnlocked: 0 };
  }
}