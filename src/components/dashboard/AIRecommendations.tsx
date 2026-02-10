import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock, ArrowRight, BookOpen, RefreshCw, Target, Brain, Lightbulb, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/config/firebase";
import { doc, getDoc } from "firebase/firestore";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: "lesson" | "practice" | "review";
  priority: "high" | "medium" | "low";
  estimatedTime: number;
  module: string;
  route: string;  // Changed from moduleRoute to route
  reason: string;
  level: string;
  score: number;
}

const typeIcons = {
  lesson: BookOpen,
  practice: Target,
  review: RefreshCw,
};

const typeStyles = {
  lesson: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  practice: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  review: "bg-orange-500/10 text-orange-500 border-orange-500/30",
};

const priorityStyles = {
  high: "bg-red-500/10 text-red-400 border-red-500/30",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  low: "bg-slate-500/10 text-slate-400 border-slate-500/30",
};

const convertFirebaseToRecommendation = (firebaseRec: any, index: number): Recommendation => {
  const getPriority = (score: number): 'high' | 'medium' | 'low' => {
    if (score >= 0.7) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  };

  const getType = (type?: string, category?: string): 'lesson' | 'practice' | 'review' => {
    if (type) {
      if (type === 'video') return 'practice';
      if (type === 'lesson') return 'lesson';
      return 'review';
    }
    
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
    route: firebaseRec.route || `/lesson/${firebaseRec.category.toLowerCase()}/${firebaseRec.id}`,  // Use route from Firebase
    reason: getReason(firebaseRec.score, index),
    level: firebaseRec.level,
    score: firebaseRec.score,
  };
};

export function AIRecommendations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState<string>('A1');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        
        const recDoc = await getDoc(doc(db, 'recommendations', user.uid));
        
        if (recDoc.exists()) {
          const data = recDoc.data();
          
          const convertedRecs = data.recommendations
            .slice(0, 3)
            .map((rec: any, index: number) => convertFirebaseToRecommendation(rec, index));
          
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

  if (!user || loading) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="p-6 overflow-hidden relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl">AI Recommendations</h3>
                <p className="text-sm text-muted-foreground">Loading your personalized recommendations...</p>
              </div>
            </div>
          </div>
          <div className="h-40 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="p-6 overflow-hidden relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl">AI Recommendations</h3>
                <p className="text-sm text-muted-foreground">Complete your profile to get recommendations</p>
              </div>
            </div>
          </div>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No recommendations yet. Take a quiz to get started!</p>
            <Button onClick={() => navigate('/quiz')}>Take Quiz</Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <Card className="p-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 via-transparent to-transparent rounded-full blur-2xl" />

        <div className="flex items-center justify-between mb-6 relative">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-display font-bold text-xl">AI Recommendations</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                Personalized for your learning journey
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate("/recommendations")}>
            <TrendingUp className="w-4 h-4" />
            View All
          </Button>
        </div>

        <div className="space-y-4 relative">
          {recommendations.map((rec, index) => {
            const TypeIcon = typeIcons[rec.type];
            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative p-4 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${typeStyles[rec.type]}`}
                    >
                      <TypeIcon className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold text-foreground">{rec.title}</h4>
                        <Badge variant="outline" className={`text-xs ${priorityStyles[rec.priority]}`}>
                          {rec.priority} priority
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{rec.description}</p>

                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {rec.estimatedTime} min
                        </span>
                        <Badge variant="secondary" className="text-xs font-normal">
                          {rec.module}
                        </Badge>
                        <Badge variant="outline" className="text-xs font-normal border-blue-500/30 text-blue-500">
                          {rec.level}
                        </Badge>
                        <span className="text-muted-foreground/70 italic hidden sm:inline">💡 {rec.reason}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                      onClick={() => {
                        console.log('🔍 Navigating to:', rec.route);  // Debug log
                        navigate(rec.route);  // Changed from rec.moduleRoute to rec.route
                      }}
                    >
                      Start
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 p-3 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>
              <strong className="text-violet-400">AI Insight:</strong> Based on your {userLevel} level,
              focus on high-priority items for best results.
            </span>
          </p>
        </div>
      </Card>
    </motion.div>
  );
}