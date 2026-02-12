// DashboardSidebar.tsx - 修复版：优先从Firebase读取level
// ✅ 先从 users.level 读取，如果没有才计算

import React, { useState, useEffect } from 'react';
import { NavLink } from '@/components/NavLink';
import { LEVELS } from '@/types/learning';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  BookOpen,
  Library,
  FileText,
  Headphones,
  PenTool,
  Mic,
  Trophy,
  Settings,
  LogOut,
  Sparkles,
  Flame,
  Video,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getStreak } from '@/utils/streakTracking';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

const mainNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Videos', url: '/videos', icon: Video },
  { title: 'AI Recommendations', url: '/recommendations', icon: Sparkles },
  { title: 'Achievements', url: '/achievements', icon: Trophy },
];

const moduleNavItems = [
  { title: 'Grammar', url: '/modules/grammar', icon: BookOpen },
  { title: 'Vocabulary', url: '/modules/vocabulary', icon: Library },
  { title: 'Reading', url: '/modules/reading', icon: FileText },
  { title: 'Listening', url: '/modules/listening', icon: Headphones },
  { title: 'Writing', url: '/modules/writing', icon: PenTool },
  { title: 'Speaking', url: '/modules/speaking', icon: Mic },
];

const bottomNavItems = [
  { title: 'Settings', url: '/settings', icon: Settings },
];

// ✅ Level计算函数（仅作为fallback）
function calculateLevel(xp: number): string {
  if (xp >= 12000) return 'C2';
  if (xp >= 8000) return 'C1';
  if (xp >= 5000) return 'B2';
  if (xp >= 2500) return 'B1';
  if (xp >= 1000) return 'A2';
  return 'A1';
}

export function DashboardSidebar() {
  const { state } = useSidebar();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const collapsed = state === 'collapsed';

  // ✅ 使用state代替context
  const [userProgress, setUserProgress] = useState({
    level: 'A1',
    xp: 0,
    streak: { current: 0 }
  });

  // ✅ 从Firebase加载数据 - 优先读取level字段
  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        // 1️⃣ 先从users collection读取level
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        let level = 'A1';
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          // ✅ 优先读取 level 字段，然后是 quizLevel
          level = userData.level || userData.quizLevel || 'A1';
          console.log('👤 Level from Firebase users:', {
            level: userData.level,
            quizLevel: userData.quizLevel,
            final: level
          });
        }
        
        // 2️⃣ 获取Streak
        const streakData = await getStreak(user.uid);
        
        // 3️⃣ 获取XP
        const statsRef = doc(db, 'users', user.uid, 'stats', 'overall');
        const statsSnap = await getDoc(statsRef);
        const totalXP = statsSnap.exists() ? (statsSnap.data().totalPoints || 0) : 0;
        
        // 4️⃣ 如果level还是默认值且有XP，才计算
        if (level === 'A1' && totalXP > 0) {
          level = calculateLevel(totalXP);
          console.log('👤 Calculated level from XP:', level);
        }
        
        // 5️⃣ 更新state
        setUserProgress({
          level,
          xp: totalXP,
          streak: { current: streakData.currentStreak }
        });

        console.log('👤 Sidebar final data:', { level, xp: totalXP, streak: streakData.currentStreak });
      } catch (error) {
        console.error('Error loading sidebar data:', error);
      }
    }

    fetchData();
  }, [user]);

  const levelInfo = LEVELS[userProgress.level];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-display font-bold text-lg">Smart Learning</h1>
              <p className="text-xs text-muted-foreground">AI-Powered English</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        {/* User Level Badge */}
        {!collapsed && (
          <div className="px-4 mb-4">
            <div className="glass-card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className={`level-badge-${levelInfo?.color}`}>
                  {userProgress.level}
                </span>
                <div className="flex items-center gap-1 streak-badge text-xs">
                  <Flame className="w-3 h-3" />
                  {userProgress.streak.current}
                </div>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">XP: </span>
                <span className="font-semibold">{userProgress.xp}</span>
              </div>
              {user && (
                <div className="text-xs text-muted-foreground truncate">
                  {user.email}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Main</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-sidebar-accent"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="w-5 h-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Learning Modules */}
        <SidebarGroup className="mt-4">
          {!collapsed && <SidebarGroupLabel>Learning Modules</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {moduleNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-sidebar-accent"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="w-5 h-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <SidebarMenu>
          {bottomNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-sidebar-accent text-muted-foreground"
                  activeClassName="text-foreground"
                >
                  <item.icon className="w-5 h-5" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              {!collapsed && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}