// AchievementsWidget.tsx - 修复进度计算
// ✅ 使用getUserProgress获取真实进度
// ✅ 修复All-Rounder显示问题

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Trophy, Star, Flame, BookOpen, Target, Zap, Medal, Crown, Lock, Sparkles,
  GraduationCap, Award, BookCheck, Sunrise, Moon, Video
} from 'lucide-react';
import { getUserProgress, calculateAchievementProgress } from '@/utils/getUserProgress';

const iconMap: Record<string, React.ElementType> = {
  BookOpen, GraduationCap, Award, Zap, Crown,
  Flame, Target, BookCheck, Sunrise, Moon,
  Video, Sparkles, Star, Medal, Trophy
};

interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  points: number;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: any;
}

interface UserAchievement {
  id?: string;
  achievementId: string;
  unlockedAt: any;
  points: number;
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

export function AchievementsWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [userProgress, setUserProgress] = useState<any>(null);  // ← 添加这个
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        // Get all achievements
        const achievementsSnap = await getDocs(collection(db, 'achievements'));
        const achievementsData = achievementsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Achievement[];
        
        setAchievements(achievementsData);

        // Get user achievements
        const userAchSnap = await getDocs(
          collection(db, 'users', user.uid, 'achievements')
        );
        const userAchData = userAchSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserAchievement[];
        
        setUserAchievements(userAchData);

        // ✅ 获取用户进度
        const progress = await getUserProgress(user.uid);
        setUserProgress(progress);
        console.log('📊 User progress loaded:', progress);

      } catch (error) {
        console.error('Error loading achievements:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const isUnlocked = (achievementId: string) => {
    const found = userAchievements.some(ua => 
      ua.achievementId === achievementId || ua.id === achievementId
    );
    // Debug
    if (found) {
      console.log('✅ Unlocked:', achievementId);
    }
    return found;
  };

  // Show top 6 achievements
  const displayAchievements = [...achievements]
    .sort((a, b) => {
      const aUnlocked = isUnlocked(a.id);
      const bUnlocked = isUnlocked(b.id);
      
      if (aUnlocked && !bUnlocked) return -1;
      if (!aUnlocked && bUnlocked) return 1;
      
      const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
    })
    .slice(0, 6);

  const unlockedCount = achievements.filter(a => isUnlocked(a.id)).length;
  const totalXP = userAchievements.reduce((acc, ua) => acc + ua.points, 0);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
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
      <Card className="p-6 overflow-hidden relative">
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
          {displayAchievements.map((achievement, index) => {
            const IconComponent = iconMap[achievement.iconName] || Trophy;
            const unlocked = isUnlocked(achievement.id);
            
            // ✅ 使用calculateAchievementProgress获取真实进度
            let progress = { current: 0, total: 1 };
            let progressPercent = 0;
            
            if (userProgress) {
              progress = calculateAchievementProgress(achievement, userProgress);
              progressPercent = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;
              
              // Debug
              console.log(`📊 ${achievement.title}: ${progress.current}/${progress.total} (${Math.round(progressPercent)}%)`);
            }
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.08 * index, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.03, y: -2 }}
                onClick={() => navigate('/achievements')}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                  unlocked 
                    ? `bg-gradient-to-br from-card to-card/80 ${rarityBorder[achievement.rarity]} shadow-lg ${rarityGlow[achievement.rarity]}`
                    : 'bg-muted/20 border-muted/30 opacity-70'
                }`}
              >
                {/* Rarity label */}
                <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  unlocked 
                    ? `bg-gradient-to-r ${rarityGradients[achievement.rarity]} text-white`
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {rarityLabels[achievement.rarity]}
                </div>

                {!unlocked && (
                  <div className="absolute top-2 right-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}

                {unlocked && (
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
                  unlocked 
                    ? `bg-gradient-to-br ${rarityGradients[achievement.rarity]} shadow-lg ${rarityGlow[achievement.rarity]}` 
                    : 'bg-muted/50'
                }`}>
                  <IconComponent className={`w-7 h-7 ${unlocked ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                
                <h4 className={`text-sm font-semibold text-center mb-1 ${
                  unlocked ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {achievement.title}
                </h4>
                
                <p className="text-xs text-muted-foreground text-center mb-3 line-clamp-2 min-h-[2rem]">
                  {achievement.description}
                </p>

                {unlocked ? (
                  <div className="flex items-center justify-center gap-1 text-xs font-medium text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400" />
                    +{achievement.points} XP earned
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Progress 
                      value={progressPercent} 
                      className="h-2 bg-muted/50"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{progress.current}/{progress.total}</span>
                      <span className="text-amber-400/70">+{achievement.points} XP</span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* View all button */}
        <div className="mt-6 flex justify-center">
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={() => navigate('/achievements')}
          >
            <Trophy className="w-4 h-4" />
            View All Achievements
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}