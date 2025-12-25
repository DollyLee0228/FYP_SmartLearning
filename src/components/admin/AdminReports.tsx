import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, BookOpen, GraduationCap, FileText, Loader2, Eye } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch user statistics from profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('level');

      if (profilesError) throw profilesError;

      // Calculate user stats
      const totalUsers = profiles?.length || 0;
      const levelCounts: Record<string, number> = {};
      profiles?.forEach((p) => {
        const level = p.level || 'A1';
        levelCounts[level] = (levelCounts[level] || 0) + 1;
      });

      const levelDistribution = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => ({
        level,
        count: levelCounts[level] || 0,
      }));

      setUserStats({ totalUsers, levelDistribution });

      // Fetch content statistics
      const { data: content, error: contentError } = await supabase
        .from('admin_content')
        .select('id, title, category, level, status');

      if (contentError) throw contentError;

      const totalContent = content?.length || 0;

      // By category
      const categoryCounts: Record<string, number> = {};
      content?.forEach((c) => {
        categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
      });
      const byCategory = Object.entries(categoryCounts).map(([category, count]) => ({
        category,
        count,
      }));

      // By level
      const contentLevelCounts: Record<string, number> = {};
      content?.forEach((c) => {
        contentLevelCounts[c.level] = (contentLevelCounts[c.level] || 0) + 1;
      });
      const byLevel = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => ({
        level,
        count: contentLevelCounts[level] || 0,
      }));

      // By status
      const statusCounts: Record<string, number> = {};
      content?.forEach((c) => {
        statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
      });
      const byStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
      }));

      setContentStats({ totalContent, byCategory, byLevel, byStatus });

      // Fetch content usage data
      const { data: usageData, error: usageError } = await supabase
        .from('content_usage')
        .select('content_id, user_id');

      if (usageError) throw usageError;

      // Calculate usage per content
      const usageMap: Record<string, { views: number; users: Set<string> }> = {};
      usageData?.forEach((u) => {
        if (!usageMap[u.content_id]) {
          usageMap[u.content_id] = { views: 0, users: new Set() };
        }
        usageMap[u.content_id].views++;
        usageMap[u.content_id].users.add(u.user_id);
      });

      // Combine with content info
      const usageList: ContentUsageItem[] = (content || []).map((c) => ({
        id: c.id,
        title: c.title,
        category: c.category,
        level: c.level,
        views: usageMap[c.id]?.views || 0,
        uniqueUsers: usageMap[c.id]?.users.size || 0,
      }));

      // Sort by views descending
      usageList.sort((a, b) => b.views - a.views);
      setContentUsage(usageList);
    } catch (error) {
      console.error('Error fetching stats:', error);
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

      {/* Content Usage Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Content Usage
          </CardTitle>
          <CardDescription>How many users have accessed each content item</CardDescription>
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
                    <TableHead className="text-foreground text-center">Total Views</TableHead>
                    <TableHead className="text-foreground text-center">Unique Users</TableHead>
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
                      <TableCell className="text-center">
                        <span className="font-semibold text-foreground">{item.views}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-primary">{item.uniqueUsers}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              No usage data yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
