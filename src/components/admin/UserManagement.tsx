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
  Loader2,
  Target,
  Award
} from 'lucide-react';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { format } from 'date-fns';

interface UserData {
  id: string;
  email: string;
  displayName?: string;
  quizLevel?: string;
  quizScore?: number;
  learningGoal?: string;
  learningGoals?: string[];
  createdAt?: any;
  updatedAt?: any;
  lastLoginAt?: any;
}

interface UserProgress {
  level?: string;
  totalXP?: number;
  completedLessons?: number;
}

interface UserStats {
  totalStudyTime?: number;
  lessonsCompleted?: number;
  exercisesCompleted?: number;
}

interface UserWithStats extends UserData {
  progress?: UserProgress;
  stats?: UserStats;
  contentViewed: number;
  lastActive: string | null;
}

export function UserManagement() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all users from Firebase
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef, orderBy('createdAt', 'desc'));
      const usersSnapshot = await getDocs(usersQuery);
      
      const usersWithStats: UserWithStats[] = await Promise.all(
        usersSnapshot.docs.map(async (userDoc) => {
          const userData = { id: userDoc.id, ...userDoc.data() } as UserData;
          
          // Fetch user progress
          let progress: UserProgress = {};
          try {
            const progressDoc = await getDoc(doc(db, 'userProgress', userDoc.id));
            if (progressDoc.exists()) {
              progress = progressDoc.data() as UserProgress;
            }
          } catch (error) {
            console.error(`Error fetching progress for user ${userDoc.id}:`, error);
          }

          // Fetch user stats
          let stats: UserStats = {};
          try {
            const statsDoc = await getDoc(doc(db, 'users', userDoc.id, 'stats', 'overall'));
            if (statsDoc.exists()) {
              stats = statsDoc.data() as UserStats;
            }
          } catch (error) {
            console.error(`Error fetching stats for user ${userDoc.id}:`, error);
          }

          // Calculate content viewed (using stats or default to 0)
          const contentViewed = (stats.lessonsCompleted || 0) + (stats.exercisesCompleted || 0);
          
          // Determine last active
          const lastActive = userData.lastLoginAt 
            ? userData.lastLoginAt 
            : userData.updatedAt || userData.createdAt;

          return {
            ...userData,
            progress,
            stats,
            contentViewed,
            lastActive: lastActive ? (lastActive.toDate ? lastActive.toDate().toISOString() : lastActive) : null
          };
        })
      );

      setUsers(usersWithStats);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.displayName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const viewUserDetails = async (user: UserWithStats) => {
    setSelectedUser(user);
    setIsDetailDialogOpen(true);
    setLoadingDetails(true);

    try {
      // Fetch additional user details if needed
      // For now, we already have most data from the initial fetch
      setLoadingDetails(false);
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getLevelColor = (level: string | null | undefined) => {
    if (!level) return 'border-muted text-muted-foreground';
    if (['A1', 'A2'].includes(level)) return 'border-green-500/50 text-green-400';
    if (['B1', 'B2'].includes(level)) return 'border-yellow-500/50 text-yellow-400';
    return 'border-purple-500/50 text-purple-400';
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '-';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return '-';
    }
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
                            {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="font-medium text-foreground">
                            {user.displayName || 'No name'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getLevelColor(user.quizLevel || user.progress?.level)}>
                          {user.quizLevel || user.progress?.level || 'Not set'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.contentViewed}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatTimestamp(user.lastActive)}
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
                  {selectedUser.displayName?.charAt(0)?.toUpperCase() || selectedUser.email?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground">
                    {selectedUser.displayName || 'No name set'}
                  </h3>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {selectedUser.email || 'No email'}
                  </p>
                </div>
                <Badge variant="outline" className={getLevelColor(selectedUser.quizLevel || selectedUser.progress?.level)}>
                  {selectedUser.quizLevel || selectedUser.progress?.level || 'Level not set'}
                </Badge>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs">Lessons Completed</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{selectedUser.stats?.lessonsCompleted || 0}</p>
                </div>
                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Award className="w-4 h-4" />
                    <span className="text-xs">Total XP</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{selectedUser.progress?.totalXP || 0}</p>
                </div>
                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <UserIcon className="w-4 h-4" />
                    <span className="text-xs">Quiz Score</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{selectedUser.quizScore || 0}%</p>
                </div>
                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Target className="w-4 h-4" />
                    <span className="text-xs">Exercises Completed</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {selectedUser.stats?.exercisesCompleted || 0}
                  </p>
                </div>
              </div>

              {/* Selected Learning Areas */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Selected Learning Areas</h4>
                {selectedUser.learningGoals && selectedUser.learningGoals.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.learningGoals.map((goal, index) => (
                      <Badge key={index} variant="secondary" className="capitalize">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No learning areas selected</p>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Joined: {formatTimestamp(selectedUser.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Activity className="w-4 h-4" />
                  <span>Last Active: {formatTimestamp(selectedUser.lastActive)}</span>
                </div>
              </div>

              {/* Study Stats */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Learning Statistics</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                    <span className="text-sm text-muted-foreground">Exercises Completed</span>
                    <span className="text-sm font-medium text-foreground">
                      {selectedUser.stats?.exercisesCompleted || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                    <span className="text-sm text-muted-foreground">Study Time (minutes)</span>
                    <span className="text-sm font-medium text-foreground">
                      {selectedUser.stats?.totalStudyTime || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                    <span className="text-sm text-muted-foreground">Current Level</span>
                    <span className="text-sm font-medium text-foreground">
                      {selectedUser.progress?.level || selectedUser.quizLevel || 'Not set'}
                    </span>
                  </div>
                </div>
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