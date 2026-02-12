// StatsCards.tsx - 修复版：优先从Firebase读取level
// ✅ 先从 users.level 读取，如果没有才计算

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { LEVELS } from '@/types/learning';
import { Flame, Trophy, BookOpen, Target, Zap } from 'lucide-react';
import { getStreak } from '@/utils/streakTracking';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

// ✅ Level计算函数（仅作为fallback）
function calculateLevel(xp: number): { level: string; name: string } {
  if (xp >= 12000) return { level: 'C2', name: 'Proficiency' };
  if (xp >= 8000) return { level: 'C1', name: 'Advanced' };
  if (xp >= 5000) return { level: 'B2', name: 'Upper Intermediate' };
  if (xp >= 2500) return { level: 'B1', name: 'Intermediate' };
  if (xp >= 1000) return { level: 'A2', name: 'Elementary' };
  return { level: 'A1', name: 'Beginner' };
}

export function StatsCards() {
  const { user } = useAuth();
  
  const [userProgress, setUserProgress] = useState({
    streak: { current: 0, longest: 0 },
    level: 'A1',
    xp: 0,
    completedLessons: 0,
    totalLessons: 99
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        setLoading(true);

        // 1️⃣ 先从users collection读取level
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        let level = 'A1';
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          // ✅ 优先读取 level 字段，然后是 quizLevel
          level = userData.level || userData.quizLevel || 'A1';
          console.log('📊 Level from Firebase users:', {
            level: userData.level,
            quizLevel: userData.quizLevel,
            final: level
          });
        }

        // 2️⃣ 获取Streak
        const streakData = await getStreak(user.uid);
        
        // 3️⃣ 获取Total XP
        const statsRef = doc(db, 'users', user.uid, 'stats', 'overall');
        const statsSnap = await getDoc(statsRef);
        const totalXP = statsSnap.exists() ? (statsSnap.data().totalPoints || 0) : 0;
        
        // 4️⃣ 如果level还是默认值且有XP，才计算
        if (level === 'A1' && totalXP > 0) {
          const calculated = calculateLevel(totalXP);
          level = calculated.level;
          console.log('📊 Calculated level from XP:', level);
        }
        
        // 5️⃣ 获取Completed Lessons
        const progressRef = doc(db, 'userProgress', user.uid);
        const progressSnap = await getDoc(progressRef);
        const lessonsDone = progressSnap.exists() 
          ? (progressSnap.data().completedLessons?.length || 0) 
          : 0;
        
        // 6️⃣ 获取Total Lessons
        const lessonsSnap = await getDocs(collection(db, 'lessons'));
        const totalLessons = lessonsSnap.size;
        
        // 7️⃣ 更新state
        setUserProgress({
          streak: {
            current: streakData.currentStreak,
            longest: streakData.longestStreak
          },
          level: level,
          xp: totalXP,
          completedLessons: lessonsDone,
          totalLessons: totalLessons
        });

        console.log('📊 Stats final data:', {
          streak: streakData.currentStreak,
          level: level,
          xp: totalXP,
          lessons: `${lessonsDone}/${totalLessons}`
        });

      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="stat-card animate-pulse">
            <div className="h-20 bg-secondary/50 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!userProgress) return null;

  const levelInfo = LEVELS[userProgress.level];
  const completionPercentage = Math.round((userProgress.completedLessons / userProgress.totalLessons) * 100);

  const stats = [
    {
      title: 'Current Streak',
      value: userProgress.streak.current,
      suffix: 'days',
      icon: Flame,
      color: 'streak',
      gradient: 'var(--gradient-streak)',
    },
    {
      title: 'English Level',
      value: userProgress.level,
      suffix: levelInfo.name,
      icon: Target,
      color: 'primary',
      gradient: 'var(--gradient-primary)',
    },
    {
      title: 'Total XP',
      value: userProgress.xp,
      suffix: 'points',
      icon: Zap,
      color: 'accent',
      gradient: 'var(--gradient-accent)',
    },
    {
      title: 'Lessons Done',
      value: userProgress.completedLessons,
      suffix: `of ${userProgress.totalLessons}`,
      icon: BookOpen,
      color: 'success',
      gradient: 'var(--gradient-primary)',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          variants={itemVariants}
          className="stat-card group hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-display font-bold">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.suffix}</span>
              </div>
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ background: stat.gradient }}
            >
              <stat.icon className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          
          {stat.title === 'Lessons Done' && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full rounded-full"
                  style={{ background: stat.gradient }}
                />
              </div>
            </div>
          )}
          
          {stat.title === 'Current Streak' && userProgress.streak.longest > 0 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Trophy className="w-3 h-3" />
              <span>Best: {userProgress.streak.longest} days</span>
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}