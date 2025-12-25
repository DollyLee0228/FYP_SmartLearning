import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useLearning } from '@/context/LearningContext';
import { Flame, Calendar, Trophy, TrendingUp } from 'lucide-react';

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function StreakWidget() {
  const { userProgress } = useLearning();

  if (!userProgress) return null;

  // Generate mock activity for the last 7 days
  const today = new Date();
  const weekActivity = weekDays.map((day, index) => {
    const active = index <= today.getDay();
    return { day, active };
  });

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
                <p className="text-4xl font-display font-bold">{userProgress.streak.current}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <Trophy className="w-4 h-4" />
                Best
              </div>
              <p className="text-2xl font-semibold">{userProgress.streak.longest}</p>
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
              {userProgress.streak.current >= 7
                ? "Amazing! You're on fire! 🔥"
                : `${7 - userProgress.streak.current} more days to reach a week streak!`}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
