// ProgressChart.tsx - 修复版
// ✅ 显示过去7天，而不是本周Mon-Sun

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { collection, getDocs, query, where, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export function ProgressChart() {
  const { user } = useAuth();
  
  const [weeklyData, setWeeklyData] = useState<Array<{ day: string; xp: number }>>([]);
  const [moduleData, setModuleData] = useState<Array<{ module: string; progress: number }>>([]);
  const [totalWeeklyXP, setTotalWeeklyXP] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        setLoading(true);

        // ===== 1️⃣ 获取Weekly Progress数据（过去7天）=====
        console.log('📊 Fetching weekly progress...');
        
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        // ✅ 生成过去7天的日期
        const past7Days: Array<{ date: Date; dayLabel: string }> = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
          past7Days.push({ date, dayLabel });
        }
        
        console.log('📅 Past 7 days:', past7Days.map(d => d.dayLabel));
        
        // 初始化每天的XP (用日期字符串作为key)
        const dailyXP: Record<string, number> = {};
        past7Days.forEach(({ date }) => {
          const dateKey = date.toISOString().split('T')[0]; // "2026-01-07"
          dailyXP[dateKey] = 0;
        });
        
        // 1a. 获取lessons的XP
        const progressRef = collection(db, 'userProgress', user.uid, 'lessons');
        const weekQuery = query(
          progressRef,
          where('completedAt', '>=', Timestamp.fromDate(weekAgo))
        );
        
        const weekSnapshot = await getDocs(weekQuery);
        
        console.log(`📊 Found ${weekSnapshot.size} lessons in the past week`);
        
        weekSnapshot.forEach(docSnap => {
          const data = docSnap.data();
          
          if (data.completedAt) {
            const date = new Date(data.completedAt.seconds * 1000);
            const dateKey = date.toISOString().split('T')[0];
            
            if (dailyXP.hasOwnProperty(dateKey)) {
              const xpEarned = data.score || 50;
              dailyXP[dateKey] += xpEarned;
              console.log(`  ${dateKey}: +${xpEarned} XP`);
            }
          }
        });
        
        // 1b. ✅ 获取achievements的XP
        const achievementsRef = collection(db, 'users', user.uid, 'achievements');
        const achievementsQuery = query(
          achievementsRef,
          where('unlockedAt', '>=', Timestamp.fromDate(weekAgo))
        );
        
        const achievementsSnapshot = await getDocs(achievementsQuery);
        
        console.log(`📊 Found ${achievementsSnapshot.size} achievements unlocked this week`);
        
        achievementsSnapshot.forEach(docSnap => {
          const data = docSnap.data();
          
          if (data.unlockedAt) {
            const date = new Date(data.unlockedAt.seconds * 1000);
            const dateKey = date.toISOString().split('T')[0];
            
            if (dailyXP.hasOwnProperty(dateKey)) {
              const xpEarned = data.points || 0;
              dailyXP[dateKey] += xpEarned;
              console.log(`  Achievement ${dateKey}: +${xpEarned} XP`);
            }
          }
        });
        
        // ✅ 转换成图表格式（按顺序，过去7天）
        const chartData = past7Days.map(({ date, dayLabel }) => {
          const dateKey = date.toISOString().split('T')[0];
          return {
            day: dayLabel,
            xp: dailyXP[dateKey] || 0
          };
        });
        
        const totalXP = Object.values(dailyXP).reduce((sum, xp) => sum + xp, 0);
        
        setWeeklyData(chartData);
        setTotalWeeklyXP(totalXP);
        
        console.log('📊 Weekly chart data:', chartData);
        console.log('📊 Total weekly XP:', totalXP);

        // ===== 2️⃣ 获取Module Progress数据 =====
        console.log('📊 Fetching module progress...');
        
        // 2a. 获取每个module的总lesson数
        const moduleIds = ['grammar', 'vocabulary', 'reading', 'listening', 'writing', 'speaking'];
        const lessonCounts: Record<string, number> = {};
        
        for (const moduleId of moduleIds) {
          const lessonsQuery = query(
            collection(db, 'lessons'),
            where('moduleId', '==', moduleId)
          );
          const lessonsSnapshot = await getDocs(lessonsQuery);
          lessonCounts[moduleId] = lessonsSnapshot.size;
        }
        
        // 2b. 获取用户的moduleProgress
        const userProgressRef = doc(db, 'userProgress', user.uid);
        const userProgressSnap = await getDoc(userProgressRef);
        
        let userModuleProgress: Record<string, any> = {};
        
        if (userProgressSnap.exists()) {
          userModuleProgress = userProgressSnap.data().moduleProgress || {};
        }
        
        // 2c. 计算每个module的百分比
        const modules = ['Grammar', 'Vocabulary', 'Reading', 'Listening', 'Writing', 'Speaking'];
        
        const chartModuleData = modules.map((moduleName, index) => {
          const moduleId = moduleIds[index];
          const progressData = userModuleProgress[moduleId] || {};
          
          const totalLessons = lessonCounts[moduleId] || 0;
          const completedLessons = progressData.completedLessons || 0;
          const progress = totalLessons > 0 
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;
          
          return {
            module: moduleName,
            progress: progress
          };
        });
        
        setModuleData(chartModuleData);

      } catch (error) {
        console.error('❌ Error loading progress data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weekly XP Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-semibold text-lg">Weekly Progress</h3>
              <p className="text-sm text-muted-foreground">Your XP earned this week</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {totalWeeklyXP}
              </p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
          </div>
          
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="day" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area
                  type="monotone"
                  dataKey="xp"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#xpGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Module Progress Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="font-display font-semibold text-lg">Module Progress</h3>
            <p className="text-sm text-muted-foreground">Completion by learning area</p>
          </div>
          
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moduleData} layout="vertical">
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis 
                  type="number" 
                  domain={[0, 100]}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  type="category" 
                  dataKey="module"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: number) => [`${value}%`, 'Progress']}
                />
                <Bar
                  dataKey="progress"
                  fill="url(#barGradient)"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}