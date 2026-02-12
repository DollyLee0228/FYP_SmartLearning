import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Target, BookOpen, MessageSquare, FileText, 
  Mic, Trophy, Clock, ArrowRight, CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/config/firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';

interface LearningGoal {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  category: string;
}

const learningGoals: LearningGoal[] = [
  {
    id: 'grammar',
    icon: BookOpen,
    label: 'Master Grammar',
    description: 'Build a strong foundation in English grammar',
    category: 'Grammar'
  },
  {
    id: 'vocabulary',
    icon: Target,
    label: 'Expand Vocabulary',
    description: 'Learn new words and phrases daily',
    category: 'Vocabulary'
  },
  {
    id: 'speaking',
    icon: Mic,
    label: 'Improve Speaking',
    description: 'Practice pronunciation and fluency',
    category: 'Speaking'
  },
  {
    id: 'listening',
    icon: MessageSquare,
    label: 'Better Listening',
    description: 'Understand native speakers with ease',
    category: 'Listening'
  },
  {
    id: 'reading',
    icon: FileText,
    label: 'Read Better',
    description: 'Comprehend articles and books',
    category: 'Reading'
  },
  {
    id: 'writing',
    icon: Trophy,
    label: 'Write Well',
    description: 'Express yourself clearly in writing',
    category: 'Writing'
  }
];

export default function LearningGoalsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLevel, setUserLevel] = useState<string>('A1');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // 获取用户的 quiz level
    const fetchUserLevel = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const level = userData.quizLevel || userData.level || 'A1';
          setUserLevel(level);
          console.log('📊 User level:', level);
        }
      } catch (error) {
        console.error('Error fetching user level:', error);
      }
    };

    fetchUserLevel();
  }, [user, navigate]);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  // 🎯 生成 AI 推荐的核心函数
  const generateRecommendations = async (goals: string[], level: string) => {
    if (!user) return;

    try {
      console.log('🤖 Generating recommendations for goals:', goals, 'level:', level);

      // 获取每个选中目标的前3个课程
      const allRecommendations: any[] = [];

      for (const goalCategory of goals) {
        // 从 lessons 集合获取匹配的课程
        const lessonsRef = collection(db, 'lessons');
        const q = query(
          lessonsRef,
          where('category', '==', goalCategory),
          where('level', '==', level),
          limit(2) // 每个类别获取2个课程
        );

        const lessonsSnap = await getDocs(q);
        
        lessonsSnap.forEach((doc) => {
          const lessonData = doc.data();
          allRecommendations.push({
            id: doc.id,
            title: lessonData.title,
            description: lessonData.description || `Learn ${lessonData.title}`,
            category: goalCategory,
            level: level,
            type: 'lesson',
            route: `/modules/${goalCategory.toLowerCase()}/lesson/${doc.id}`,
            score: 0.8 + Math.random() * 0.2, // 随机分数 0.8-1.0
            createdAt: new Date().toISOString()
          });
        });
      }

      // 如果没有找到课程，创建默认推荐
      if (allRecommendations.length === 0) {
        console.warn('⚠️ No lessons found, creating default recommendations');
        
        goals.forEach((goalCategory, index) => {
          allRecommendations.push({
            id: `default-${goalCategory}-${Date.now()}-${index}`,
            title: `${goalCategory} Basics`,
            description: `Start your ${goalCategory.toLowerCase()} learning journey`,
            category: goalCategory,
            level: level,
            type: 'lesson',
            route: `/modules/${goalCategory.toLowerCase()}`,
            score: 0.9 - index * 0.1,
            createdAt: new Date().toISOString()
          });
        });
      }

      // 按分数排序
      allRecommendations.sort((a, b) => b.score - a.score);

      // 保存到 Firebase recommendations 集合
      const recommendationsRef = doc(db, 'recommendations', user.uid);
      await setDoc(recommendationsRef, {
        recommendations: allRecommendations,
        userLevel: level,
        learningGoals: goals,
        generatedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });

      console.log('✅ Recommendations saved successfully:', allRecommendations.length, 'items');
      return allRecommendations;

    } catch (error) {
      console.error('❌ Error generating recommendations:', error);
      throw error;
    }
  };

  const handleContinue = async () => {
    if (selectedGoals.length === 0) {
      alert('Please select at least one learning goal');
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      // 1️⃣ 保存学习目标到 users 集合
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          learningGoals: selectedGoals,
          learningGoalsCompleted: true,
          level: userLevel, // ✅ 确保 level 字段存在
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );

      console.log('✅ Learning goals saved to users collection');

      // 2️⃣ 生成 AI 推荐并保存到 recommendations 集合
      await generateRecommendations(selectedGoals, userLevel);

      console.log('✅ All data saved successfully, redirecting to dashboard...');

      // 3️⃣ 跳转到 Dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);

    } catch (error) {
      console.error('❌ Error saving learning goals:', error);
      alert('Failed to save learning goals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">What are your learning goals?</h1>
          <p className="text-muted-foreground">
            Select the areas you want to improve (you can change these later)
          </p>
          <Badge variant="outline" className="mt-2">
            Your Level: {userLevel}
          </Badge>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        >
          {learningGoals.map((goal, index) => {
            const Icon = goal.icon;
            const isSelected = selectedGoals.includes(goal.category);

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card
                  className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => toggleGoal(goal.category)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isSelected
                            ? 'bg-primary text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{goal.label}</h3>
                        <p className="text-sm text-muted-foreground">
                          {goal.description}
                        </p>
                      </div>
                    </div>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleGoal(goal.category)}
                      className="mt-1"
                    />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {selectedGoals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">
                {selectedGoals.length} goal{selectedGoals.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <p className="text-sm text-blue-700">
              We'll personalize your learning experience based on these goals
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-4"
        >
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            disabled={loading}
          >
            Skip for now
          </Button>
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={selectedGoals.length === 0 || loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                Continue to Dashboard
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </motion.div>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Takes about 30 seconds to complete</span>
          </div>
        </div>
      </div>
    </div>
  );
}