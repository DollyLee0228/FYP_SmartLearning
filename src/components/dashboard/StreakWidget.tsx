// StreakWidget.tsx - 连接到Firebase的完整版本
// ✅ 显示真实的streak数据
// ✅ 显示真实的打卡历史

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Flame, Calendar, Trophy, TrendingUp } from 'lucide-react';
import { getStreak, getWeeklyStreakHistory } from '@/utils/streakTracking';

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function StreakWidget() {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null as Date | null
  });
  const [weekActivity, setWeekActivity] = useState<Array<{ day: string; active: boolean }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStreakData() {
      if (!user) return;

      try {
        // ✅ 获取真实的streak数据
        const data = await getStreak(user.uid);
        
        const lastDate = data.lastCompletedDate 
          ? new Date(data.lastCompletedDate.seconds * 1000)
          : null;
        
        setStreakData({
          currentStreak: data.currentStreak,
          longestStreak: data.longestStreak,
          lastCompletedDate: lastDate
        });

        // ✅ 生成过去7天的打卡历史
        const history = getWeeklyStreakHistory(lastDate, data.currentStreak);
        
        // 转换成weekActivity格式
        const activity = history.map((item, index) => ({
          day: weekDays[index],
          active: item.completed
        }));
        
        setWeekActivity(activity);

        console.log('🔥 Streak data loaded:', {
          current: data.currentStreak,
          longest: data.longestStreak,
          activity
        });
      } catch (error) {
        console.error('Error loading streak:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStreakData();
  }, [user]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="p-6 relative overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl"
          style={{ background: 'var(--gradient-streak)' }}
        />

        <div className="relative space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--gradient-streak)' }}
              >
                <Flame className="w-8 h-8 text-streak-foreground" />
              </motion.div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-4xl font-display font-bold">
                  {streakData.currentStreak}
                </p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <Trophy className="w-4 h-4" />
                Best
              </div>
              <p className="text-2xl font-semibold">{streakData.longestStreak}</p>
            </div>
          </div>

          {/* Week Calendar */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">This Week</p>
            <div className="flex justify-between gap-2">
              {weekActivity.map((day, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex flex-col items-center gap-2"
                >
                  <span className="text-xs text-muted-foreground">{day.day}</span>
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      day.active
                        ? 'text-streak-foreground'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                    style={day.active ? { background: 'var(--gradient-streak)' } : {}}
                  >
                    {day.active ? (
                      <Flame className="w-5 h-5" />
                    ) : (
                      <Calendar className="w-5 h-5" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Encouragement */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-streak/10 text-sm">
            <TrendingUp className="w-5 h-5 text-streak" />
            <span>
              {streakData.currentStreak >= 7
                ? "Amazing! You're on fire! 🔥"
                : streakData.currentStreak === 0
                ? "Complete a lesson today to start your streak! 💪"
                : `${7 - streakData.currentStreak} more days to reach a week streak!`}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}