import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Flame, BookOpen, Target, Zap, Medal, Crown, Lock, Sparkles } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
}

const rarityGradients = {
  common: 'from-slate-400 to-slate-600',
  rare: 'from-blue-400 to-cyan-500',
  epic: 'from-purple-400 to-pink-500',
  legendary: 'from-amber-400 via-yellow-500 to-orange-500',
};

const rarityGlow = {
  common: 'shadow-slate-500/20',
  rare: 'shadow-blue-500/30',
  epic: 'shadow-purple-500/40',
  legendary: 'shadow-amber-500/50',
};

const rarityBorder = {
  common: 'border-slate-500/30 hover:border-slate-400/50',
  rare: 'border-blue-500/30 hover:border-blue-400/50',
  epic: 'border-purple-500/30 hover:border-purple-400/50',
  legendary: 'border-amber-500/30 hover:border-amber-400/50 animate-pulse',
};

const rarityLabels = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

const achievements: Achievement[] = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: BookOpen,
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    rarity: 'common',
    xpReward: 50,
  },
  {
    id: '2',
    title: 'Streak Master',
    description: 'Maintain a 7-day learning streak',
    icon: Flame,
    progress: 5,
    maxProgress: 7,
    unlocked: false,
    rarity: 'rare',
    xpReward: 150,
  },
  {
    id: '3',
    title: 'Perfect Score',
    description: 'Get 100% on any quiz',
    icon: Target,
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    rarity: 'rare',
    xpReward: 100,
  },
  {
    id: '4',
    title: 'Vocabulary Guru',
    description: 'Learn 100 new words',
    icon: Zap,
    progress: 45,
    maxProgress: 100,
    unlocked: false,
    rarity: 'epic',
    xpReward: 300,
  },
  {
    id: '5',
    title: 'Grammar Champion',
    description: 'Complete all grammar modules',
    icon: Crown,
    progress: 2,
    maxProgress: 6,
    unlocked: false,
    rarity: 'legendary',
    xpReward: 500,
  },
  {
    id: '6',
    title: 'Quick Learner',
    description: 'Complete 5 lessons in one day',
    icon: Medal,
    progress: 3,
    maxProgress: 5,
    unlocked: false,
    rarity: 'epic',
    xpReward: 200,
  },
];

export function AchievementsWidget() {
  const navigate = useNavigate();
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalXP = achievements.filter(a => a.unlocked).reduce((acc, a) => acc + a.xpReward, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="p-6 overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gradient-to-b from-amber-500/10 to-transparent rounded-full blur-3xl" />
        
        <div className="flex items-center justify-between mb-6 relative">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <motion.div 
                className="absolute -top-1 -right-1"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
              </motion.div>
            </div>
            <div>
              <h3 className="font-display font-bold text-xl">Achievements</h3>
              <p className="text-sm text-muted-foreground">
                {unlockedCount} of {achievements.length} unlocked
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="font-bold text-amber-400">{totalXP} XP</span>
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 relative">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            const progressPercent = (achievement.progress / achievement.maxProgress) * 100;
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.08 * index, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.03, y: -2 }}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                  achievement.unlocked 
                    ? `bg-gradient-to-br from-card to-card/80 ${rarityBorder[achievement.rarity]} shadow-lg ${rarityGlow[achievement.rarity]}`
                    : 'bg-muted/20 border-muted/30 opacity-70'
                }`}
              >
                {/* Rarity label */}
                <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  achievement.unlocked 
                    ? `bg-gradient-to-r ${rarityGradients[achievement.rarity]} text-white`
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {rarityLabels[achievement.rarity]}
                </div>

                {/* Lock icon for locked achievements */}
                {!achievement.unlocked && (
                  <div className="absolute top-2 right-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}

                {/* Star for unlocked */}
                {achievement.unlocked && (
                  <motion.div 
                    className="absolute top-2 right-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                  >
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow-lg" />
                  </motion.div>
                )}
                
                {/* Icon */}
                <div className={`w-14 h-14 mx-auto mt-4 mb-3 rounded-2xl flex items-center justify-center ${
                  achievement.unlocked 
                    ? `bg-gradient-to-br ${rarityGradients[achievement.rarity]} shadow-lg ${rarityGlow[achievement.rarity]}` 
                    : 'bg-muted/50'
                }`}>
                  <Icon className={`w-7 h-7 ${achievement.unlocked ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                
                {/* Title */}
                <h4 className={`text-sm font-semibold text-center mb-1 ${
                  achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {achievement.title}
                </h4>
                
                {/* Description */}
                <p className="text-xs text-muted-foreground text-center mb-3 line-clamp-2 min-h-[2rem]">
                  {achievement.description}
                </p>

                {/* Progress or XP reward */}
                {achievement.unlocked ? (
                  <div className="flex items-center justify-center gap-1 text-xs font-medium text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400" />
                    +{achievement.xpReward} XP earned
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Progress 
                      value={progressPercent} 
                      className="h-2 bg-muted/50"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                      <span className="text-amber-400/70">+{achievement.xpReward} XP</span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* View all button */}
        <div className="mt-6 flex justify-center">
          <Button variant="outline" className="gap-2" onClick={() => navigate('/achievements')}>
            <Trophy className="w-4 h-4" />
            View All Achievements
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
