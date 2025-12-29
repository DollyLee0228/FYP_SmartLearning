import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/hooks/useAuth';
import {
  BookOpen,
  Library,
  FileText,
  Headphones,
  PenTool,
  Mic,
  Play,
  Loader2,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Library,
  FileText,
  Headphones,
  PenTool,
  Mic,
};

const colorMap: Record<string, string> = {
  cyan: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',      // cyan → blue
  purple: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',    // purple → pink
  blue: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',      // blue
  green: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',     // green
  orange: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',    // orange
  red: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',       // red
};

interface ModuleData {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  totalLessons: number;
  completedLessons: number;
  order: number;
}

export function ModuleGrid() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleLessonCounts, setModuleLessonCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchModulesAndProgress() {
      try {
        setLoading(true);
        console.log('🔍 Fetching modules from Firebase...');

        // 1️⃣ 获取所有modules
        const modulesSnapshot = await getDocs(collection(db, 'modules'));
        const modulesData = modulesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log('✅ Modules loaded:', modulesData);

        // ✅ 2️⃣ 获取每个module的真实lesson数量
        console.log('📊 Fetching lesson counts for each module...');
        const lessonCounts: Record<string, number> = {};
        
        for (const module of modulesData) {
          const lessonsQuery = query(
            collection(db, 'lessons'),
            where('moduleId', '==', module.id)
          );
          const lessonsSnapshot = await getDocs(lessonsQuery);
          lessonCounts[module.id] = lessonsSnapshot.size;
          console.log(`  ${module.id}: ${lessonsSnapshot.size} lessons`);
        }
        
        setModuleLessonCounts(lessonCounts);
        console.log('✅ Lesson counts loaded:', lessonCounts);

        // 3️⃣ 获取用户进度
        let userModuleProgress: Record<string, any> = {};
        
        if (user) {
          console.log('👤 Fetching user progress for:', user.uid);
          
          const userProgressRef = doc(db, 'userProgress', user.uid);
          const userProgressSnap = await getDoc(userProgressRef);
          
          if (userProgressSnap.exists()) {
            const progressData = userProgressSnap.data();
            userModuleProgress = progressData.moduleProgress || {};
            console.log('✅ User module progress:', userModuleProgress);
          } else {
            console.log('⚠️ No user progress found');
          }
        } else {
          console.log('📭 User not logged in');
        }

        // 4️⃣ 合并modules数据和进度数据
        const modulesWithProgress: ModuleData[] = modulesData.map((module: any) => {
          const progressData = userModuleProgress[module.id] || {};
          
          return {
            id: module.id,
            title: module.title || 'Untitled Module',
            description: module.description || '',
            icon: module.icon || 'BookOpen',
            color: module.color || 'primary',
            // ✅ 使用真实查询到的lesson数量
            totalLessons: lessonCounts[module.id] || 0,
            completedLessons: progressData.completedLessons || 0,
            order: module.order || 0,
          };
        });

        // 按order排序
        modulesWithProgress.sort((a, b) => a.order - b.order);

        setModules(modulesWithProgress);
        console.log('✅ Final modules with progress:', modulesWithProgress);

      } catch (error) {
        console.error('❌ Error fetching modules:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchModulesAndProgress();
  }, [user]); // 依赖user，当登录/登出时重新加载

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Empty state
  if (modules.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No modules available yet.</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="mb-6">
        <h2 className="font-display font-semibold text-xl">Learning Modules</h2>
        <p className="text-sm text-muted-foreground">Continue where you left off</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => {
          const Icon = iconMap[module.icon] || BookOpen;
          const progress = module.totalLessons > 0 
            ? Math.round((module.completedLessons / module.totalLessons) * 100)
            : 0;
          const gradient = colorMap[module.color] || colorMap.cyan;

          return (
            <motion.div key={module.id} variants={itemVariants}>
              <Card
                className="module-card group relative overflow-hidden cursor-pointer"
                onClick={() => navigate(`/modules/${module.id}`)}
              >
                {/* Background decoration */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 opacity-10 -translate-y-8 translate-x-8 rounded-full blur-2xl transition-all group-hover:opacity-20"
                  style={{ background: gradient }}
                />

                <div className="relative space-y-4">
                  {/* Icon and Play Button */}
                  <div className="flex items-start justify-between">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: gradient }}
                    >
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground">
                      <Play className="w-4 h-4 ml-0.5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="font-semibold text-lg">{module.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {module.description}
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {module.completedLessons} of {module.totalLessons} lessons
                      </span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}