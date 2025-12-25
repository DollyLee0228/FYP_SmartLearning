import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, Star, Flame, BookOpen, Target, Zap, Medal, Crown, 
  Lock, Sparkles, ArrowLeft, Award, TrendingUp
} from 'lucide-react';

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
  category: 'learning' | 'streak' | 'mastery' | 'special';
  unlockedAt?: string;
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
  legendary: 'border-amber-500/30 hover:border-amber-400/50',
};

const rarityLabels = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

const categoryLabels = {
  learning: 'Learning',
  streak: 'Streaks',
  mastery: 'Mastery',
  special: 'Special',
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
    category: 'learning',
    unlockedAt: '2024-01-15',
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
    category: 'streak',
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
    category: 'mastery',
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
    category: 'mastery',
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
    category: 'mastery',
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
    category: 'learning',
  },
  {
    id: '7',
    title: 'Week Warrior',
    description: 'Learn every day for a week',
    icon: Flame,
    progress: 5,
    maxProgress: 7,
    unlocked: false,
    rarity: 'rare',
    xpReward: 175,
    category: 'streak',
  },
  {
    id: '8',
    title: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: Award,
    progress: 5,
    maxProgress: 30,
    unlocked: false,
    rarity: 'legendary',
    xpReward: 1000,
    category: 'streak',
  },
  {
    id: '9',
    title: 'Early Bird',
    description: 'Complete a lesson before 8 AM',
    icon: Sparkles,
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    rarity: 'common',
    xpReward: 50,
    category: 'special',
  },
  {
    id: '10',
    title: 'Night Owl',
    description: 'Complete a lesson after 10 PM',
    icon: Star,
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    rarity: 'common',
    xpReward: 50,
    category: 'special',
    unlockedAt: '2024-01-20',
  },
  {
    id: '11',
    title: 'Perfectionist',
    description: 'Get 100% on 10 quizzes',
    icon: Target,
    progress: 2,
    maxProgress: 10,
    unlocked: false,
    rarity: 'epic',
    xpReward: 400,
    category: 'mastery',
  },
  {
    id: '12',
    title: 'Bookworm',
    description: 'Complete 50 lessons',
    icon: BookOpen,
    progress: 12,
    maxProgress: 50,
    unlocked: false,
    rarity: 'rare',
    xpReward: 250,
    category: 'learning',
  },
];

function AchievementCard({ achievement, index }: { achievement: Achievement; index: number }) {
  const Icon = achievement.icon;
  const progressPercent = (achievement.progress / achievement.maxProgress) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.05 * index, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
        achievement.unlocked 
          ? `bg-gradient-to-br from-card to-card/80 ${rarityBorder[achievement.rarity]} shadow-xl ${rarityGlow[achievement.rarity]}`
          : 'bg-muted/20 border-muted/30 opacity-60'
      }`}
    >
      {/* Rarity label */}
      <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
        achievement.unlocked 
          ? `bg-gradient-to-r ${rarityGradients[achievement.rarity]} text-white shadow-lg`
          : 'bg-muted text-muted-foreground'
      }`}>
        {rarityLabels[achievement.rarity]}
      </div>

      {/* Lock/Star icon */}
      {!achievement.unlocked ? (
        <div className="absolute top-3 right-3">
          <Lock className="w-5 h-5 text-muted-foreground" />
        </div>
      ) : (
        <motion.div 
          className="absolute top-3 right-3"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Star className="w-6 h-6 text-amber-400 fill-amber-400 drop-shadow-lg" />
        </motion.div>
      )}
      
      {/* Icon */}
      <div className={`w-16 h-16 mx-auto mt-6 mb-4 rounded-2xl flex items-center justify-center ${
        achievement.unlocked 
          ? `bg-gradient-to-br ${rarityGradients[achievement.rarity]} shadow-xl ${rarityGlow[achievement.rarity]}` 
          : 'bg-muted/50'
      }`}>
        <Icon className={`w-8 h-8 ${achievement.unlocked ? 'text-white' : 'text-muted-foreground'}`} />
      </div>
      
      {/* Title */}
      <h4 className={`text-base font-bold text-center mb-1 ${
        achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
      }`}>
        {achievement.title}
      </h4>
      
      {/* Description */}
      <p className="text-sm text-muted-foreground text-center mb-4 min-h-[2.5rem]">
        {achievement.description}
      </p>

      {/* Progress or XP reward */}
      {achievement.unlocked ? (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-amber-400">
            <Star className="w-4 h-4 fill-amber-400" />
            +{achievement.xpReward} XP earned
          </div>
          {achievement.unlockedAt && (
            <p className="text-xs text-center text-muted-foreground">
              Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Progress value={progressPercent} className="h-2.5 bg-muted/50" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">{achievement.progress}/{achievement.maxProgress}</span>
            <span className="text-amber-400/80 flex items-center gap-1">
              <Star className="w-3.5 h-3.5" />
              +{achievement.xpReward} XP
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function AchievementsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalXP = achievements.filter(a => a.unlocked).reduce((acc, a) => acc + a.xpReward, 0);
  const totalProgress = Math.round((unlockedCount / achievements.length) * 100);

  const filteredAchievements = activeTab === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === activeTab);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white">
        <DashboardSidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mb-4 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center justify-between">
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
                  <h1 className="font-display font-bold text-2xl text-foreground">Achievements</h1>
                  <p className="text-sm text-muted-foreground">{unlockedCount} of {achievements.length} unlocked</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                <span className="font-bold text-xl text-amber-400">{totalXP} XP</span>
              </div>
            </div>
          </div>

          {/* Overall Progress */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Overall Progress</h3>
                </div>
                <span className="text-2xl font-bold text-primary">{totalProgress}%</span>
              </div>
              <Progress value={totalProgress} className="h-3" />
              <div className="flex justify-between mt-3 text-sm text-muted-foreground">
                <span>{unlockedCount} achievements unlocked</span>
                <span>{achievements.length - unlockedCount} remaining</span>
              </div>
            </Card>
          </motion.div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="learning">{categoryLabels.learning}</TabsTrigger>
              <TabsTrigger value="streak">{categoryLabels.streak}</TabsTrigger>
              <TabsTrigger value="mastery">{categoryLabels.mastery}</TabsTrigger>
              <TabsTrigger value="special">{categoryLabels.special}</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredAchievements.map((achievement, index) => (
              <AchievementCard key={achievement.id} achievement={achievement} index={index} />
            ))}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No achievements in this category yet</p>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
