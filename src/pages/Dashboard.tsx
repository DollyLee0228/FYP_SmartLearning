import React from 'react';
import { motion } from 'framer-motion';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ProgressChart } from '@/components/dashboard/ProgressChart';
import { AIRecommendations } from '@/components/dashboard/AIRecommendations';
import { AchievementsWidget } from '@/components/dashboard/AchievementsWidget';
import { ModuleGrid } from '@/components/dashboard/ModuleGrid';
import { StreakWidget } from '@/components/dashboard/StreakWidget';
import { useLearning } from '@/context/LearningContext';
import { LEVELS } from '@/types/learning';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getUserProgress } from '@/utils/progressTracking';

export default function Dashboard() {
  const { userProgress } = useLearning();
  const levelInfo = userProgress ? LEVELS[userProgress.level] : null;
  // const [moduleLessonCounts, setModuleLessonCounts] = useState<Record<string, number>>({});

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        
        <main className="flex-1 overflow-auto">
          {/* Top Bar */}
          <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="hidden md:block">
                  <h1 className="font-display font-bold text-xl">
                    Welcome back! 👋
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Ready to continue your learning journey?
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="p-6 space-y-8">
            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <StatsCards />
            </motion.div>

            {/* Charts and Streak */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <ProgressChart />
              </div>
              <div>
                <StreakWidget />
              </div>
            </div>

            {/* AI Recommendations */}
            <AIRecommendations />

            {/* Achievements */}
            <AchievementsWidget />

            {/* Module Grid */}
            <ModuleGrid />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
