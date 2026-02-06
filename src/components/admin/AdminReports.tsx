import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, BookOpen, GraduationCap, FileText, Loader2, Eye, TrendingUp, Activity, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, Area, AreaChart } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface UserStats {
  totalUsers: number;
  levelDistribution: { level: string; count: number }[];
}

interface ContentStats {
  totalContent: number;
  byCategory: { category: string; count: number }[];
  byLevel: { level: string; count: number }[];
  byStatus: { status: string; count: number }[];
}

interface ContentUsageItem {
  id: string;
  title: string;
  category: string;
  level: string;
  views: number;
  uniqueUsers: number;
}

// New interfaces for enhanced reports
interface LearningProgressStats {
  avgCompletedLessons: number;
  avgStudyTimeMinutes: number;
  totalCompletions: number;
  usersWithProgress: number;
}

interface ActivityStats {
  activeToday: number;
  activeThisWeek: number;
  activeThisMonth: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
}

interface TrendData {
  date: string;
  newUsers: number;
  activeUsers: number;
}

const LEVEL_COLORS: Record<string, string> = {
  A1: 'hsl(142, 76%, 36%)',
  A2: 'hsl(142, 69%, 58%)',
  B1: 'hsl(45, 93%, 47%)',
  B2: 'hsl(38, 92%, 50%)',
  C1: 'hsl(0, 84%, 60%)',
  C2: 'hsl(0, 72%, 51%)',
};

const CATEGORY_COLORS = [
  'hsl(221, 83%, 53%)',
  'hsl(262, 83%, 58%)',
  'hsl(316, 72%, 52%)',
  'hsl(24, 94%, 50%)',
  'hsl(142, 76%, 36%)',
  'hsl(45, 93%, 47%)',
];

export function AdminReports() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [contentStats, setContentStats] = useState<ContentStats | null>(null);
  const [contentUsage, setContentUsage] = useState<ContentUsageItem[]>([]);
  const [learningProgress, setLearningProgress] = useState<LearningProgressStats | null>(null);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch user statistics
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const totalUsers = users.length;
      
      // Calculate level distribution
      const levelCounts: Record<string, number> = {};
      users.forEach((user: any) => {
        const level = user.quizLevel || user.level || 'A1';
        levelCounts[level] = (levelCounts[level] || 0) + 1;
      });

      const levelDistribution = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => ({
        level,
        count: levelCounts[level] || 0,
      }));

      setUserStats({ totalUsers, levelDistribution });
      console.log('✅ User stats loaded:', { totalUsers, levelDistribution });

      // === NEW: Calculate Activity Stats ===
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      let activeToday = 0;
      let activeThisWeek = 0;
      let activeThisMonth = 0;
      let newUsersLast7Days = 0;
      let newUsersLast30Days = 0;

      users.forEach((user: any) => {
        // Check last active
        const lastActive = user.lastActive?.toDate ? user.lastActive.toDate() : null;
        if (lastActive) {
          if (lastActive >= today) activeToday++;
          if (lastActive >= weekAgo) activeThisWeek++;
          if (lastActive >= monthAgo) activeThisMonth++;
        }

        // Check registration date
        const createdAt = user.createdAt?.toDate ? user.createdAt.toDate() : null;
        if (createdAt) {
          if (createdAt >= weekAgo) newUsersLast7Days++;
          if (createdAt >= monthAgo) newUsersLast30Days++;
        }
      });

      setActivityStats({
        activeToday,
        activeThisWeek,
        activeThisMonth,
        newUsersLast7Days,
        newUsersLast30Days
      });
      console.log('✅ Activity stats loaded:', { activeToday, activeThisWeek, activeThisMonth });

      // === NEW: Calculate Trend Data (last 30 days) ===
      const trendMap: Record<string, { newUsers: number; activeUsers: number }> = {};
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        trendMap[dateStr] = { newUsers: 0, activeUsers: 0 };
      }

      users.forEach((user: any) => {
        // Count new users by registration date
        const createdAt = user.createdAt?.toDate ? user.createdAt.toDate() : null;
        if (createdAt) {
          const dateStr = createdAt.toISOString().split('T')[0];
          if (trendMap[dateStr]) {
            trendMap[dateStr].newUsers++;
          }
        }

        // Count active users by last active date
        const lastActive = user.lastActive?.toDate ? user.lastActive.toDate() : null;
        if (lastActive) {
          const dateStr = lastActive.toISOString().split('T')[0];
          if (trendMap[dateStr]) {
            trendMap[dateStr].activeUsers++;
          }
        }
      });

      const trends = Object.entries(trendMap).map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        newUsers: data.newUsers,
        activeUsers: data.activeUsers
      }));

      setTrendData(trends);
      console.log('✅ Trend data loaded');

      // === NEW: Fetch Learning Progress Stats ===
      const progressSnapshot = await getDocs(collection(db, 'userProgress'));
      const progressData = progressSnapshot.docs.map(doc => doc.data());

      let totalCompletedLessons = 0;
      let totalStudyTime = 0;
      let usersWithProgress = progressData.length;

      progressData.forEach((progress: any) => {
        totalCompletedLessons += (progress.completedLessons?.length || 0);
        totalStudyTime += (progress.totalStudyTime || 0);
      });

      const avgCompletedLessons = usersWithProgress > 0 ? Math.round(totalCompletedLessons / usersWithProgress) : 0;
      const avgStudyTimeMinutes = usersWithProgress > 0 ? Math.round(totalStudyTime / usersWithProgress / 60) : 0;

      setLearningProgress({
        avgCompletedLessons,
        avgStudyTimeMinutes,
        totalCompletions: totalCompletedLessons,
        usersWithProgress
      });
      console.log('✅ Learning progress loaded:', { avgCompletedLessons, avgStudyTimeMinutes });

      // Fetch content statistics
      const contentSnapshot = await getDocs(collection(db, 'adminContent'));
      const lessonsSnapshot = await getDocs(collection(db, 'lessonContent'));
      const videosSnapshot = await getDocs(collection(db, 'videos'));
      
      const allContent = [
        ...contentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        ...lessonsSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          category: doc.data().moduleId,
          level: doc.data().level
        })),
        ...videosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      ];
      
      const totalContent = allContent.length;

      // By category
      const categoryCounts: Record<string, number> = {};
      allContent.forEach((c: any) => {
        const cat = c.category || c.moduleId || 'Other';
        const categoryName = typeof cat === 'string' 
          ? cat.charAt(0).toUpperCase() + cat.slice(1)
          : 'Other';
        categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
      });
      const byCategory = Object.entries(categoryCounts).map(([category, count]) => ({
        category,
        count: count as number,
      }));

      // By level
      const contentLevelCounts: Record<string, number> = {};
      allContent.forEach((c: any) => {
        const level = (c.level || 'A1').toUpperCase();
        contentLevelCounts[level] = (contentLevelCounts[level] || 0) + 1;
      });
      const byLevel = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => ({
        level,
        count: contentLevelCounts[level] || 0,
      }));

      // By status
      const statusCounts: Record<string, number> = {};
      allContent.forEach((c: any) => {
        const status = c.status || 'published';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      const byStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count: count as number,
      }));

      setContentStats({ totalContent, byCategory, byLevel, byStatus });
      console.log('✅ Content stats loaded:', { totalContent, byCategory, byLevel, byStatus });

      // For now, set empty content usage (you can add tracking later)
      const usageList: ContentUsageItem[] = allContent.map((c: any) => ({
        id: c.id,
        title: c.title || c.introduction?.title || 'Untitled',
        category: typeof c.category === 'string' ? c.category : (c.moduleId || 'Other'),
        level: c.level || 'A1',
        views: 0,
        uniqueUsers: 0,
      }));

      setContentUsage(usageList);
      console.log('✅ Content usage loaded');
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{userStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered learners</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Content</CardTitle>
            <BookOpen className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{contentStats?.totalContent || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Lessons & exercises</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
            <FileText className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{contentStats?.byCategory.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active categories</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
            <GraduationCap className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {contentStats?.byStatus.find((s) => s.status === 'Published')?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Live content</p>
          </CardContent>
        </Card>
      </div>

      {/* NEW: Activity Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Today</CardTitle>
            <Activity className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{activityStats?.activeToday || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Users active today</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active This Week</CardTitle>
            <Activity className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{activityStats?.activeThisWeek || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active This Month</CardTitle>
            <Activity className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{activityStats?.activeThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Users (7d)</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{activityStats?.newUsersLast7Days || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered this week</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Users (30d)</CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{activityStats?.newUsersLast30Days || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered this month</p>
          </CardContent>
        </Card>
      </div>

      {/* NEW: Learning Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Completed Lessons</CardTitle>
            <BookOpen className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{learningProgress?.avgCompletedLessons || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Per active user</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Study Time</CardTitle>
            <Clock className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{learningProgress?.avgStudyTimeMinutes || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Minutes per user</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Completions</CardTitle>
            <GraduationCap className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{learningProgress?.totalCompletions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Lessons completed</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Users With Progress</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{learningProgress?.usersWithProgress || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Have started learning</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Level Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">User Level Distribution</CardTitle>
            <CardDescription>English proficiency levels of registered users</CardDescription>
          </CardHeader>
          <CardContent>
            {userStats && userStats.totalUsers > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={userStats.levelDistribution.filter((d) => d.count > 0)}
                    dataKey="count"
                    nameKey="level"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ level, count }) => `${level}: ${count}`}
                  >
                    {userStats.levelDistribution.map((entry) => (
                      <Cell key={entry.level} fill={LEVEL_COLORS[entry.level]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No user data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content by Category */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Content by Category</CardTitle>
            <CardDescription>Distribution of uploaded content across categories</CardDescription>
          </CardHeader>
          <CardContent>
            {contentStats && contentStats.totalContent > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={contentStats.byCategory}>
                  <XAxis dataKey="category" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" name="Content Count">
                    {contentStats.byCategory.map((_, index) => (
                      <Cell key={index} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No content data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Content by Level */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Content by Level</CardTitle>
          <CardDescription>How content is distributed across difficulty levels</CardDescription>
        </CardHeader>
        <CardContent>
          {contentStats && contentStats.totalContent > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={contentStats.byLevel} layout="vertical">
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis dataKey="level" type="category" tick={{ fill: 'hsl(var(--muted-foreground))' }} width={40} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" name="Content Count">
                  {contentStats.byLevel.map((entry) => (
                    <Cell key={entry.level} fill={LEVEL_COLORS[entry.level]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              No content data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* NEW: 30-Day Trend Chart */}
      <Card className="bg-card border-border lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-foreground">30-Day Activity Trends</CardTitle>
          <CardDescription>New user registrations and daily active users over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="newUsers" 
                  stroke="hsl(142, 76%, 36%)" 
                  fillOpacity={1} 
                  fill="url(#colorNew)"
                  name="New Users"
                />
                <Area 
                  type="monotone" 
                  dataKey="activeUsers" 
                  stroke="hsl(221, 83%, 53%)" 
                  fillOpacity={1} 
                  fill="url(#colorActive)"
                  name="Active Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No trend data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content List
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Eye className="w-5 h-5" />
            All Content
          </CardTitle>
          <CardDescription>List of all content in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {contentUsage.length > 0 ? (
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-foreground">Title</TableHead>
                    <TableHead className="text-foreground">Category</TableHead>
                    <TableHead className="text-foreground">Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentUsage.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-foreground">{item.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          style={{ backgroundColor: LEVEL_COLORS[item.level], color: 'white' }}
                          className="text-xs"
                        >
                          {item.level}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              No content yet
            </div>
          )}
        </CardContent>
      </Card> */}
    </div>
  );
}