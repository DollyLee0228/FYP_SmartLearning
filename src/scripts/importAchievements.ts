// importAchievements.ts - Duolingo风格版本
// 使用Lucide React图标

import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

// 🏆 Achievement数据 - 使用Lucide图标名称
const achievementsData = [
  // ===== 📚 Learning (Lessons) =====
  {
    id: 'first-lesson',
    title: 'First Steps',
    description: 'Complete your first lesson',
    iconName: 'BookOpen',  // ← Lucide icon name
    iconBg: 'bg-blue-500',  // ← Icon background color
    points: 60,
    category: 'learning',
    rarity: 'common',
    requirement: { type: 'lessons_completed', count: 1 }
  },
  {
    id: 'getting-started',
    title: 'Scholar',
    description: 'Complete 5 lessons',
    iconName: 'GraduationCap',
    iconBg: 'bg-blue-500',
    points: 150,
    category: 'learning',
    rarity: 'common',
    requirement: { type: 'lessons_completed', count: 5 }
  },
  {
    id: 'dedicated-learner',
    title: 'Dedicated Learner',
    description: 'Complete 10 lessons',
    iconName: 'Award',
    iconBg: 'bg-blue-500',
    points: 300,
    category: 'learning',
    rarity: 'rare',
    requirement: { type: 'lessons_completed', count: 10 }
  },
  {
    id: 'learning-machine',
    title: 'Learning Machine',
    description: 'Complete 25 lessons',
    iconName: 'Zap',
    iconBg: 'bg-blue-500',
    points: 600,
    category: 'learning',
    rarity: 'epic',
    requirement: { type: 'lessons_completed', count: 25 }
  },
  {
    id: 'master-student',
    title: 'Master Student',
    description: 'Complete 50 lessons',
    iconName: 'Crown',
    iconBg: 'bg-yellow-500',
    points: 1500,
    category: 'learning',
    rarity: 'legendary',
    requirement: { type: 'lessons_completed', count: 50 }
  },

  // ===== 🔥 Streaks =====
  {
    id: 'three-day-streak',
    title: 'Streak Starter',
    description: 'Maintain a 3-day learning streak',
    iconName: 'Flame',
    iconBg: 'bg-orange-500',
    points: 150,
    category: 'streaks',
    rarity: 'rare',
    requirement: { type: 'streak', days: 3 }
  },
  {
    id: 'week-warrior',
    title: 'Streak Master',
    description: 'Maintain a 7-day learning streak',
    iconName: 'Flame',
    iconBg: 'bg-orange-500',
    points: 300,
    category: 'streaks',
    rarity: 'rare',
    requirement: { type: 'streak', days: 7 }
  },
  {
    id: 'two-week-champion',
    title: 'Streak Legend',
    description: 'Maintain a 14-day learning streak',
    iconName: 'Flame',
    iconBg: 'bg-red-500',
    points: 600,
    category: 'streaks',
    rarity: 'epic',
    requirement: { type: 'streak', days: 14 }
  },

  // ===== 🎯 Mastery (Performance) =====
  {
    id: 'perfect-score',
    title: 'Perfect Score',
    description: 'Get 100% on any quiz',
    iconName: 'Target',
    iconBg: 'bg-green-500',
    points: 300,
    category: 'mastery',
    rarity: 'rare',
    requirement: { type: 'perfect_scores', count: 1 }
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Get 100% on 5 quizzes',
    iconName: 'Star',
    iconBg: 'bg-yellow-500',
    points: 900,
    category: 'mastery',
    rarity: 'epic',
    requirement: { type: 'perfect_scores', count: 5 }
  },
  {
    id: 'vocabulary-guru',
    title: 'Vocabulary Guru',
    description: 'Learn 100 new words',
    iconName: 'Zap',
    iconBg: 'bg-purple-500',
    points: 1800,
    category: 'mastery',
    rarity: 'epic',
    requirement: { type: 'module_lessons', moduleId: 'vocabulary', count: 100 }
  },
  {
    id: 'grammar-master',
    title: 'Grammar Master',
    description: 'Complete all Grammar lessons',
    iconName: 'BookCheck',
    iconBg: 'bg-blue-600',
    points: 600,
    category: 'mastery',
    rarity: 'epic',
    requirement: { type: 'module_completed', moduleId: 'grammar' }
  },

  // ===== ⭐ Special =====
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Complete a lesson before 9 AM',
    iconName: 'Sunrise',
    iconBg: 'bg-yellow-400',
    points: 150,
    category: 'special',
    rarity: 'common',
    requirement: { type: 'time_of_day', period: 'morning' }
  },
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'Complete a lesson after 10 PM',
    iconName: 'Moon',
    iconBg: 'bg-indigo-500',
    points: 150,
    category: 'special',
    rarity: 'common',
    requirement: { type: 'time_of_day', period: 'night' }
  },
  {
    id: 'video-watcher',
    title: 'Video Enthusiast',
    description: 'Watch 10 educational videos',
    iconName: 'Video',
    iconBg: 'bg-pink-500',
    points: 300,
    category: 'special',
    rarity: 'rare',
    requirement: { type: 'videos_watched', count: 10 }
  },
  {
    id: 'all-rounder',
    title: 'All-Rounder',
    description: 'Try all 6 learning modules',
    iconName: 'Sparkles',
    iconBg: 'bg-purple-500',
    points: 600,
    category: 'special',
    rarity: 'epic',
    requirement: { type: 'all_modules', count: 6 }
  }
];

// ✅ 导入函数
export async function importAchievements() {
  try {
    console.log('🏆 Starting achievements import...');
    
    let successCount = 0;
    let errorCount = 0;

    for (const achievement of achievementsData) {
      try {
        await setDoc(doc(db, 'achievements', achievement.id), achievement);
        successCount++;
        console.log(`✅ Imported: ${achievement.title}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed: ${achievement.title}`, error);
      }
    }

    console.log('🎉 Import complete!');
    console.log(`✅ Success: ${successCount}/${achievementsData.length}`);
    
    return {
      success: true,
      successCount,
      errorCount,
      total: achievementsData.length
    };
  } catch (error) {
    console.error('❌ Import failed:', error);
    return { success: false, error };
  }
}