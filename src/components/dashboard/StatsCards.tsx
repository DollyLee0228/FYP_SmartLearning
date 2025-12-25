import React from 'react';
import { motion } from 'framer-motion';
import { useLearning } from '@/context/LearningContext';
import { LEVELS } from '@/types/learning';
import { Flame, Trophy, BookOpen, Target, TrendingUp, Zap } from 'lucide-react';

export function StatsCards() {
  const { userProgress } = useLearning();

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
