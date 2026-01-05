// AchievementsPage.tsx - 带真实进度版本
// 1. 显示真实用户进度
// 2. 已解锁的achievements显示不同

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, Trophy, Star, Lock, Loader2, Check,
  BookOpen, GraduationCap, Award, Zap, Crown,
  Flame, Target, BookCheck, Sunrise, Moon, 
  Video, Sparkles, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { getUserProgress, calculateAchievementProgress } from '@/utils/getUserProgress';

const iconMap: Record<string, any> = {
  BookOpen, GraduationCap, Award, Zap, Crown,
  Flame, Target, BookCheck, Sunrise, Moon,
  Video, Sparkles, Star
};

interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  iconBg: string;
  points: number;
  category: string;
  rarity: string;
  requirement: any;
}

interface UserAchievement {
  achievementId: string;
  unlockedAt: any;
  points: number;
}

interface UserProgress {
  lessonsCompleted: number;
  perfectScores: number;
  avgScore: number;
  moduleProgress: Record<string, number>;
  currentStreak: number;
  videosWatched: number;
}

const rarityConfig = {
  common: { label: 'COMMON', color: 'bg-gray-500/20 text-gray-600', border: 'border-gray-300' },
  rare: { label: 'RARE', color: 'bg-blue-500/20 text-blue-600', border: 'border-blue-400' },
  epic: { label: 'EPIC', color: 'bg-purple-500/20 text-purple-600', border: 'border-purple-400' },
  legendary: { label: 'LEGENDARY', color: 'bg-yellow-500/20 text-yellow-600', border: 'border-yellow-400' },
};

export default function AchievementsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [stats, setStats] = useState({ totalPoints: 0, achievementsUnlocked: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'learning', label: 'Learning' },
    { id: 'streaks', label: 'Streaks' },
    { id: 'mastery', label: 'Mastery' },
    { id: 'special', label: 'Special' },
  ];

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        setLoading(true);

        // Get achievements
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
        const userAchData = userAchSnap.docs.map(doc => doc.data()) as UserAchievement[];
        setUserAchievements(userAchData);

        // Get user progress
        const progress = await getUserProgress(user.uid);
        setUserProgress(progress);

        // Get stats
        const statsRef = doc(db, 'users', user.uid, 'stats', 'overall');
        const statsSnap = await getDoc(statsRef);
        
        if (statsSnap.exists()) {
          setStats({
            totalPoints: statsSnap.data().totalPoints || 0,
            achievementsUnlocked: statsSnap.data().achievementsUnlocked || 0
          });
        }

      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load achievements');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const filteredAchievements = achievements.filter(a => 
    selectedCategory === 'all' || a.category === selectedCategory
  );

  const isUnlocked = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievementId === achievementId);
  };

  const getUnlockDate = (achievementId: string) => {
    const userAch = userAchievements.find(ua => ua.achievementId === achievementId);
    if (userAch?.unlockedAt) {
      const date = new Date(userAch.unlockedAt.seconds * 1000);
      return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
    }
    return null;
  };

  const getProgress = (achievement: Achievement) => {
    if (!userProgress) return { current: 0, total: 1 };
    return calculateAchievementProgress(achievement, userProgress);
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-gray-50">
          <DashboardSidebar />
          <main className="flex-1 p-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  const progressPercent = achievements.length > 0 
    ? Math.round((stats.achievementsUnlocked / achievements.length) * 100) 
    : 0;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <DashboardSidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mb-4 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
                  <p className="text-gray-600">{stats.achievementsUnlocked} of {achievements.length} unlocked</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border-2 border-yellow-200">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-xl font-bold text-yellow-600">{stats.totalPoints} XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Progress */}
          <Card className="p-6 mb-8 bg-white border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
              </div>
              <span className="text-2xl font-bold text-emerald-600">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-3 mb-2" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{stats.achievementsUnlocked} achievements unlocked</span>
              <span>{achievements.length - stats.achievementsUnlocked} remaining</span>
            </div>
          </Card>

          {/* Category Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap ${
                  selectedCategory === cat.id 
                    ? 'bg-gray-900 text-white hover:bg-gray-800' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAchievements.map((ach, i) => {
              const unlocked = isUnlocked(ach.id);
              const date = getUnlockDate(ach.id);
              const progress = getProgress(ach);
              const IconComponent = iconMap[ach.iconName] || Star;
              const rarity = rarityConfig[ach.rarity as keyof typeof rarityConfig] || rarityConfig.common;
              const progressPercent = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

              return (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className={`
                    relative p-5 bg-white border-2 
                    ${unlocked ? rarity.border + ' shadow-md' : 'border-gray-200 opacity-70'}
                    hover:shadow-lg transition-all duration-200
                    h-[320px] flex flex-col
                  `}>
                    {/* Rarity Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge className={`text-xs font-semibold ${rarity.color}`}>
                        {rarity.label}
                      </Badge>
                    </div>

                    {/* Star/Lock/Check Icon */}
                    <div className="absolute top-2 right-2">
                      {unlocked ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    {/* Icon */}
                    <div className={`
                      w-16 h-16 mx-auto mb-3 mt-4 rounded-2xl 
                      ${unlocked ? ach.iconBg : 'bg-gray-300'} 
                      ${!unlocked && 'grayscale opacity-50'}
                      flex items-center justify-center shadow-lg
                    `}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col">
                      <h3 className="font-bold text-base text-center mb-1 text-gray-900">
                        {ach.title}
                      </h3>
                      <p className="text-xs text-center text-gray-600 mb-3 flex-1 line-clamp-2">
                        {ach.description}
                      </p>

                      {/* Progress Bar */}
                      {!unlocked && progress.total > 1 && (
                        <div className="mb-3">
                          <Progress 
                            value={progressPercent} 
                            className="h-1.5 mb-1" 
                          />
                          <p className="text-xs text-center text-gray-500">
                            {progress.current}/{progress.total}
                          </p>
                        </div>
                      )}

                      {/* Spacer */}
                      {!unlocked && progress.total <= 1 && (
                        <div className="mb-3 h-6"></div>
                      )}

                      {/* XP */}
                      <div className={`
                        flex items-center justify-center gap-1 mt-auto
                        ${unlocked ? 'text-emerald-600' : 'text-yellow-600'}
                      `}>
                        <Star className={`w-3.5 h-3.5 ${unlocked ? 'fill-emerald-500' : 'fill-yellow-500'}`} />
                        <span className="font-bold text-sm">
                          {unlocked ? `+${ach.points} XP earned` : `+${ach.points} XP`}
                        </span>
                      </div>

                      {/* Date */}
                      {unlocked && date && (
                        <p className="text-xs text-center text-gray-500 mt-2">
                          Unlocked on {date}
                        </p>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No achievements in this category</p>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}