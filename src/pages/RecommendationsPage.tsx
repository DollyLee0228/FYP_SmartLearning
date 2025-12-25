import React from 'react';
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

const recommendations: Recommendation[] = [
  {
    id: '1',
    title: 'Present Simple Tense',
    description: 'Master the present simple tense with interactive exercises and real-world examples',
    type: 'lesson',
    priority: 'high',
    estimatedTime: 15,
    module: 'Grammar',
    reason: 'Based on your quiz results',
    xpReward: 100,
    route: '/modules/grammar/lesson/grammar-1',
  },
  {
    id: '2',
    title: 'Everyday Essentials',
    description: 'Learn essential everyday English vocabulary for daily conversations',
    type: 'practice',
    priority: 'medium',
    estimatedTime: 10,
    module: 'Vocabulary',
    reason: 'Expand your word bank',
    xpReward: 75,
    route: '/modules/vocabulary/lesson/vocabulary-1',
  },
  {
    id: '3',
    title: 'Basic Pronunciation',
    description: 'Practice basic pronunciation with speaking exercises',
    type: 'review',
    priority: 'low',
    estimatedTime: 8,
    module: 'Speaking',
    reason: "It's been 5 days since last practice",
    xpReward: 50,
    route: '/modules/speaking/exercise/speaking-1',
  },
  {
    id: '4',
    title: 'Reading Comprehension',
    description: 'Practice reading comprehension with passages and questions',
    type: 'lesson',
    priority: 'high',
    estimatedTime: 20,
    module: 'Reading',
    reason: 'Essential for fluency',
    xpReward: 120,
    route: '/modules/reading/exercise/reading-1',
  },
  {
    id: '5',
    title: 'Listening Practice',
    description: 'Practice understanding native speakers with various accents and speeds',
    type: 'practice',
    priority: 'medium',
    estimatedTime: 15,
    module: 'Listening',
    reason: 'Improve your ear training',
    xpReward: 90,
    route: '/modules/listening/exercise/listening-1',
  },
  {
    id: '6',
    title: 'Writing Skills',
    description: 'Practice your writing skills with guided prompts',
    type: 'review',
    priority: 'medium',
    estimatedTime: 12,
    module: 'Writing',
    reason: 'Common mistake area',
    xpReward: 60,
    route: '/modules/writing/exercise/writing-1',
  },
];

export default function RecommendationsPage() {
  const navigate = useNavigate();

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

          {/* AI Insight Banner */}
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
                  Based on your learning patterns, you're <span className="text-violet-400 font-medium">72% more likely</span> to retain grammar lessons in the morning. 
                  We've prioritized grammar content for you today. Your vocabulary retention is strongest after completing listening exercises.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Search and Filter */}
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

          {/* Stats */}
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

          {/* Recommendations Grid */}
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
                      {/* Type Icon */}
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border ${typeStyles[rec.type]}`}>
                        <TypeIcon className="w-7 h-7" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{rec.title}</h3>
                          <Badge variant="outline" className={`text-xs ${priorityStyles[rec.priority]}`}>
                            {rec.priority} priority
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {rec.module}
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

                      {/* Action Button */}
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
