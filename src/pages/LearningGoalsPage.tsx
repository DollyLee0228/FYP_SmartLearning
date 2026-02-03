// LearningGoalsPage.tsx - 完整版
// ✅ 读取quiz结果并保存到Firebase

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, Library, FileText, Headphones, PenTool, Mic, Check, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface LearningGoal {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const learningGoals: LearningGoal[] = [
  {
    id: 'grammar',
    title: 'Grammar Fundamentals',
    description: 'Master English grammar rules and sentence structures',
    icon: <BookOpen className="w-8 h-8" />,
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'vocabulary',
    title: 'Vocabulary Builder',
    description: 'Expand your word power with contextual learning',
    icon: <Library className="w-8 h-8" />,
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'reading',
    title: 'Reading Comprehension',
    description: 'Improve reading skills with diverse texts',
    icon: <FileText className="w-8 h-8" />,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'listening',
    title: 'Listening Skills',
    description: 'Train your ear with native speakers',
    icon: <Headphones className="w-8 h-8" />,
    color: 'from-yellow-500 to-amber-500',
  },
  {
    id: 'writing',
    title: 'Writing Practice',
    description: 'Develop clear and effective writing',
    icon: <PenTool className="w-8 h-8" />,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'speaking',
    title: 'Speaking & Pronunciation',
    description: 'Practice speaking with AI feedback',
    icon: <Mic className="w-8 h-8" />,
    color: 'from-rose-500 to-pink-500',
  },
];

const LearningGoalsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    async function checkGoalsCompleted() {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists() && userSnap.data().learningGoalsCompleted) {
          console.log('✅ User already completed learning goals, redirecting...');
          navigate('/dashboard');
          return;
        }

        const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
        const settingsSnap = await getDoc(settingsRef);
        
        if (settingsSnap.exists() && settingsSnap.data().learningGoals) {
          setSelectedGoals(settingsSnap.data().learningGoals);
        }

        setInitializing(false);
      } catch (error) {
        console.error('Error checking goals:', error);
        setInitializing(false);
      }
    }

    checkGoalsCompleted();
  }, [user, navigate]);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleContinue = async () => {
    if (selectedGoals.length === 0) {
      toast.error('Please select at least one learning goal');
      return;
    }

    if (!user) {
      toast.error('Please log in first');
      navigate('/auth');
      return;
    }

    try {
      setLoading(true);

      // ✅ 读取quiz结果（从localStorage）
      const pendingLevel = localStorage.getItem('smartlearning_pending_level') || 'A1';
      const pendingScore = localStorage.getItem('smartlearning_pending_score') || '0';
      
      console.log('📊 Quiz results:', { level: pendingLevel, score: pendingScore });

      // 1. 保存learning goals到用户设置
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
      await setDoc(settingsRef, {
        learningGoals: selectedGoals,
        updatedAt: new Date()
      }, { merge: true });

      // 2. 标记用户已完成learning goals设置
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        learningGoalsCompleted: true,
        learningGoals: selectedGoals,
        quizLevel: pendingLevel,  // ✅ 保存quiz结果
        quizScore: parseInt(pendingScore),
        completedAt: new Date()
      }, { merge: true });

      // 3. 创建/更新userProgress
      const progressRef = doc(db, 'userProgress', user.uid);
      const progressSnap = await getDoc(progressRef);
      
      if (!progressSnap.exists()) {
        // 新用户 - 创建初始progress
        await setDoc(progressRef, {
          userId: user.uid,
          level: pendingLevel,  // ✅ 使用quiz的level
          xp: 0,
          totalLessonsCompleted: 0,
          completedLessons: [],
          moduleProgress: {},
          learningGoals: selectedGoals,
          quizScore: parseInt(pendingScore),  // ✅ 保存quiz分数
          streak: {
            current: 0,
            longest: 0,
            lastActiveDate: '',
          },
          createdAt: new Date(),
          lastUpdated: new Date(),
        });
        console.log('✅ Created initial user progress with quiz level:', pendingLevel);
      } else {
        // 已存在的progress - 更新learning goals和level
        await setDoc(progressRef, {
          learningGoals: selectedGoals,
          level: pendingLevel,
          quizScore: parseInt(pendingScore),
          lastUpdated: new Date(),
        }, { merge: true });
        console.log('✅ Updated existing user progress');
      }

      // 4. 初始化stats（如果不存在）
      const statsRef = doc(db, 'users', user.uid, 'stats', 'overall');
      const statsSnap = await getDoc(statsRef);
      
      if (!statsSnap.exists()) {
        await setDoc(statsRef, {
          totalPoints: 0,
          achievementsUnlocked: 0,
          weeklyXP: 0
        });
      }

      const streakRef = doc(db, 'users', user.uid, 'stats', 'streak');
      const streakSnap = await getDoc(streakRef);
      
      if (!streakSnap.exists()) {
        await setDoc(streakRef, {
          currentStreak: 0,
          longestStreak: 0,
          lastCompletedDate: null,
          streakHistory: []
        });
      }

      // ✅ 清除localStorage的临时数据
      localStorage.removeItem('smartlearning_pending_level');
      localStorage.removeItem('smartlearning_pending_score');
      
      console.log('✅ Learning goals and quiz results saved successfully');
      
      toast.success('Great choices! Let\'s start learning!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);

    } catch (error) {
      console.error('❌ Error saving learning goals:', error);
      toast.error('Failed to save your goals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/20 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-8 h-8 text-purple-500" />
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            What do you want to learn?
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Select the areas you'd like to focus on. You can always change this later in Settings.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full mb-8"
      >
        {learningGoals.map((goal) => {
          const isSelected = selectedGoals.includes(goal.id);
          
          return (
            <motion.div key={goal.id} variants={itemVariants}>
              <Card
                onClick={() => toggleGoal(goal.id)}
                className={`relative cursor-pointer p-6 transition-all duration-300 hover:scale-105 border-2 ${
                  isSelected 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-border hover:border-purple-500/50'
                }`}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}
                
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center text-white mb-4`}>
                  {goal.icon}
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{goal.title}</h3>
                <p className="text-sm text-muted-foreground">{goal.description}</p>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <Button
          onClick={handleContinue}
          size="lg"
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-6 text-lg"
          disabled={selectedGoals.length === 0 || loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              Continue to Dashboard
              {selectedGoals.length > 0 && (
                <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">
                  {selectedGoals.length} selected
                </span>
              )}
            </>
          )}
        </Button>
        
        <p className="text-sm text-muted-foreground">
          Selected: {selectedGoals.length} / {learningGoals.length}
        </p>
      </motion.div>
    </div>
  );
};

export default LearningGoalsPage;