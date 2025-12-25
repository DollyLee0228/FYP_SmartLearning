import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Eye, 
  Mail,
  Calendar,
  Activity,
  BookOpen,
  User as UserIcon,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  level: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface UserWithStats extends UserProfile {
  contentViewed: number;
  lastActive: string | null;
}

export function UserManagement() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [userContentUsage, setUserContentUsage] = useState<{ title: string; type: string; viewed_at: string }[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch content usage stats for each user
      const { data: usageData, error: usageError } = await supabase
        .from('content_usage')
        .select('user_id, viewed_at');

      if (usageError) throw usageError;

      // Calculate stats for each user
      const usersWithStats: UserWithStats[] = (profiles || []).map(profile => {
        const userUsage = usageData?.filter(u => u.user_id === profile.user_id) || [];
        const lastViewed = userUsage.length > 0 
          ? userUsage.sort((a, b) => new Date(b.viewed_at).getTime() - new Date(a.viewed_at).getTime())[0]?.viewed_at 
          : null;

        return {
          ...profile,
          contentViewed: userUsage.length,
          lastActive: lastViewed || profile.updated_at
        };
      });

      setUsers(usersWithStats);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.display_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const viewUserDetails = async (user: UserWithStats) => {
    setSelectedUser(user);
    setIsDetailDialogOpen(true);
    setLoadingDetails(true);

    try {
      // Fetch detailed content usage for this user
      const { data: usage, error } = await supabase
        .from('content_usage')
        .select(`
          viewed_at,
          content_id,
          admin_content (
            title,
            type
          )
        `)
        .eq('user_id', user.user_id)
        .order('viewed_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedUsage = (usage || []).map(item => ({
        title: (item.admin_content as any)?.title || 'Unknown',
        type: (item.admin_content as any)?.type || 'Unknown',
        viewed_at: item.viewed_at
      }));

      setUserContentUsage(formattedUsage);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setUserContentUsage([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getLevelColor = (level: string | null) => {
    if (!level) return 'border-muted text-muted-foreground';
    if (['A1', 'A2'].includes(level)) return 'border-green-500/50 text-green-400';
    if (['B1', 'B2'].includes(level)) return 'border-yellow-500/50 text-yellow-400';
    return 'border-purple-500/50 text-purple-400';
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">User Management</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-border"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Users Table */}
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">User</TableHead>
                    <TableHead className="text-muted-foreground">Email</TableHead>
                    <TableHead className="text-muted-foreground">Level</TableHead>
                    <TableHead className="text-muted-foreground">Content Viewed</TableHead>
                    <TableHead className="text-muted-foreground">Last Active</TableHead>
                    <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-border hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                            {user.display_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="font-medium text-foreground">
                            {user.display_name || 'No name'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getLevelColor(user.level)}>
                          {user.level || 'Not set'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.contentViewed}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.lastActive ? format(new Date(user.lastActive), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => viewUserDetails(user)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {users.length === 0 ? 'No users registered yet.' : 'No users found matching your search.'}
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* User Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">User Profile & Learning Progress</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                  {selectedUser.display_name?.charAt(0)?.toUpperCase() || selectedUser.email?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground">
                    {selectedUser.display_name || 'No name set'}
                  </h3>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {selectedUser.email || 'No email'}
                  </p>
                </div>
                <Badge variant="outline" className={getLevelColor(selectedUser.level)}>
                  {selectedUser.level || 'Level not set'}
                </Badge>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs">Content Viewed</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{selectedUser.contentViewed}</p>
                </div>
                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <UserIcon className="w-4 h-4" />
                    <span className="text-xs">English Level</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{selectedUser.level || 'N/A'}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Joined: {format(new Date(selectedUser.created_at), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Activity className="w-4 h-4" />
                  <span>Last Active: {selectedUser.lastActive ? format(new Date(selectedUser.lastActive), 'MMM d, yyyy') : 'Never'}</span>
                </div>
              </div>

              {/* Content Usage History */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Recent Learning Activity</h4>
                {loadingDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : userContentUsage.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {userContentUsage.map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{item.title}</p>
                            <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(item.viewed_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No learning activity recorded yet.
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
