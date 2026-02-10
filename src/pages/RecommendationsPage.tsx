import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Sparkles, Clock, ArrowRight, ArrowLeft, BookOpen, RefreshCw, Target, 
  Brain, Lightbulb, TrendingUp, Search, Filter, Zap, Star
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'lesson' | 'practice' | 'review';
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number;
  module: string;
  reason: string;
  xpReward: number;
  route: string;
  category: string;
  level: string;
  score: number;
}

const typeIcons = {
  lesson: BookOpen,
  practice: Target,
  review: RefreshCw,
};

const typeStyles = {
  lesson: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  practice: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  review: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
};

const priorityStyles = {
  high: 'bg-red-500/10 text-red-400 border-red-500/30',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  low: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
};

// 从 Firebase 数据转换为 UI 格式（保持真实路由）
const convertFirebaseToRecommendation = (firebaseRec: any, index: number): Recommendation => {
  const getPriority = (score: number): 'high' | 'medium' | 'low' => {
    if (score >= 0.7) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  };

  const getType = (type?: string, category?: string): 'lesson' | 'practice' | 'review' => {
    // 优先使用 Firebase 提供的 type
    if (type) {
      if (type === 'video') return 'practice';
      if (type === 'lesson') return 'lesson';
      return 'review';
    }
    
    // 否则根据 category 判断
    const lowerCategory = (category || '').toLowerCase();
    if (lowerCategory.includes('grammar') || lowerCategory.includes('vocabulary')) return 'lesson';
    if (lowerCategory.includes('practice') || lowerCategory.includes('exercise')) return 'practice';
    return 'review';
  };

  const getEstimatedTime = (level: string): number => {
    const levelMap: { [key: string]: number } = {
      'A1': 10, 'A2': 12, 'B1': 15, 'B2': 18, 'C1': 20, 'C2': 25
    };
    return levelMap[level] || 15;
  };

  const getXpReward = (score: number, level: string): number => {
    const baseXp = 50;
    const scoreBonus = Math.round(score * 100);
    const levelBonus = { 'A1': 0, 'A2': 10, 'B1': 20, 'B2': 30, 'C1': 40, 'C2': 50 }[level] || 0;
    return baseXp + scoreBonus + levelBonus;
  };

  const getReason = (score: number, index: number): string => {
    if (index === 0) return 'Best match for your learning goals';
    if (score >= 0.8) return 'Highly recommended based on your profile';
    if (score >= 0.6) return 'Great match for your current level';
    return 'Recommended to expand your skills';
  };

  return {
    id: firebaseRec.id,
    title: firebaseRec.title,
    description: firebaseRec.description || `Master ${firebaseRec.title.toLowerCase()} with interactive exercises`,
    type: getType(firebaseRec.type, firebaseRec.category),
    priority: getPriority(firebaseRec.score),
    estimatedTime: getEstimatedTime(firebaseRec.level),
    module: firebaseRec.category,
    reason: getReason(firebaseRec.score, index),
    xpReward: getXpReward(firebaseRec.score, firebaseRec.level),
    route: firebaseRec.route || `/modules/${firebaseRec.category.toLowerCase()}/lesson/${firebaseRec.id}`, // 使用 Firebase 提供的真实路由
    category: firebaseRec.category,
    level: firebaseRec.level,
    score: firebaseRec.score,
  };
};

export default function RecommendationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState<string>('A1');

  useEffect(() => {
    if (!user) return;

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        
        const recDoc = await getDoc(doc(db, 'recommendations', user.uid));
        
        if (recDoc.exists()) {
          const data = recDoc.data();
          
          const convertedRecs = data.recommendations.map((rec: any, index: number) => 
            convertFirebaseToRecommendation(rec, index)
          );
          
          setRecommendations(convertedRecs);
          setUserLevel(data.userLevel || 'A1');
        } else {
          console.log('No recommendations found');
          setRecommendations([]);
        }
        
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-white">
          <DashboardSidebar />
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your personalized recommendations...</p>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (recommendations.length === 0) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-white">
          <DashboardSidebar />
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mb-4 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-12 h-12 text-violet-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">No Recommendations Yet</h2>
                <p className="text-muted-foreground mb-6">
                  Complete your profile and take a quiz to get personalized learning recommendations!
                </p>
                <Button onClick={() => navigate('/dashboard')} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white">
        <DashboardSidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mb-4 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-2xl text-foreground">AI Recommendations</h1>
                <p className="text-sm text-muted-foreground">Personalized learning path just for you</p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border border-violet-500/20"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Your Learning Insight</h3>
                <p className="text-muted-foreground">
                  Based on your <span className="text-violet-400 font-medium">{userLevel}</span> level and learning goals, 
                  we've curated {recommendations.length} personalized lessons for you. 
                  Start with high-priority items for the best results!
                </p>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search recommendations..." 
                className="pl-10 bg-white border-gray-300 text-black placeholder:text-gray-500" 
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Recommendations', value: recommendations.length, icon: Lightbulb, color: 'text-violet-400' },
              { label: 'High Priority', value: recommendations.filter(r => r.priority === 'high').length, icon: Zap, color: 'text-red-400' },
              { label: 'Total XP Available', value: recommendations.reduce((acc, r) => acc + r.xpReward, 0), icon: Star, color: 'text-amber-400' },
              { label: 'Est. Time', value: `${recommendations.reduce((acc, r) => acc + r.estimatedTime, 0)} min`, icon: Clock, color: 'text-blue-400' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-4">
            {recommendations.map((rec, index) => {
              const TypeIcon = typeIcons[rec.type];
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Card className="p-6 hover:border-primary/40 transition-all duration-300 group cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border ${typeStyles[rec.type]}`}>
                        <TypeIcon className="w-7 h-7" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{rec.title}</h3>
                          <Badge variant="outline" className={`text-xs ${priorityStyles[rec.priority]}`}>
                            {rec.priority} priority
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {rec.module}
                          </Badge>
                          <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-500">
                            {rec.level}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-3">{rec.description}</p>
                        
                        <div className="flex items-center gap-6 text-sm">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {rec.estimatedTime} min
                          </span>
                          <span className="flex items-center gap-1.5 text-amber-400">
                            <Star className="w-4 h-4 fill-amber-400" />
                            +{rec.xpReward} XP
                          </span>
                          <span className="text-muted-foreground/70 italic hidden md:inline">
                            💡 {rec.reason}
                          </span>
                        </div>
                      </div>

                      <Button 
                        className="opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                        onClick={() => navigate(rec.route)}
                      >
                        Start Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}