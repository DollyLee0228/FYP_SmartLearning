// SettingsPage.tsx - 修复版
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/config/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import {
  ArrowLeft, User, Palette, Shield, 
  Moon, Sun, Volume2, Globe, Loader2, BookOpen, Library, 
  FileText, Headphones, PenTool, Mic, Check
} from 'lucide-react';

// ✅ 获取当前用户 - 使用 Firebase Auth
const getCurrentUser = () => {
  const auth = getAuth();
  return auth.currentUser;
};

// Toast 简化版
const showMessage = (message: string, isError = false) => {
  const prefix = isError ? '❌' : '✅';
  console.log(prefix, message);
  alert(prefix + ' ' + message);
};

// Learning goals 图标映射
const goalIcons: Record<string, any> = {
  grammar: BookOpen,
  vocabulary: Library,
  reading: FileText,
  listening: Headphones,
  writing: PenTool,
  speaking: Mic,
};

const goalLabels: Record<string, string> = {
  grammar: 'Grammar Fundamentals',
  vocabulary: 'Vocabulary Builder',
  reading: 'Reading Comprehension',
  listening: 'Listening Skills',
  writing: 'Writing Practice',
  speaking: 'Speaking & Pronunciation',
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile data
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [learningGoal, setLearningGoal] = useState('fluency');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  // Preferences
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // 初始化 - 获取用户
  useEffect(() => {
    const currentUser = getCurrentUser();
    console.log('📌 Current user:', currentUser);
    
    if (!currentUser) {
      console.log('❌ No user found, redirecting to auth');
      navigate('/auth');
      return;
    }
    
    setUser(currentUser);
  }, [navigate]);

  // 加载设置
  useEffect(() => {
    if (!user) return;

    async function loadSettings() {
      try {
        setLoading(true);
        console.log('📥 Loading settings for user:', user.uid);

        // 1. 加载用户 profile
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          console.log('✅ User data loaded:', userData);
          
          setDisplayName(userData.displayName || user.displayName || '');
          setEmail(userData.email || user.email || '');
          setBio(userData.bio || '');
          setLearningGoal(userData.learningGoal || 'fluency');
          setSelectedGoals(userData.learningGoals || []);
        } else {
          console.log('⚠️ User document not found, using default values');
          setDisplayName(user.displayName || '');
          setEmail(user.email || '');
        }

        // 2. 加载用户设置
        const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
        const settingsSnap = await getDoc(settingsRef);
        
        if (settingsSnap.exists()) {
          const settings = settingsSnap.data();
          console.log('✅ Settings loaded:', settings);
          
          setSoundEffects(settings.soundEffects ?? true);
          setAutoplay(settings.autoplay ?? true);
          setDarkMode(settings.darkMode ?? true);
        } else {
          console.log('⚠️ Settings not found, using defaults');
        }

        console.log('✅ All settings loaded successfully');
      } catch (error) {
        console.error('❌ Error loading settings:', error);
        showMessage('Failed to load settings', true);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [user]);

  // 保存 Profile
  const handleSaveProfile = async () => {
    if (!user) {
      showMessage('Please login first', true);
      return;
    }

    try {
      setSaving(true);
      console.log('💾 Saving profile...');

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        displayName,
        bio,
        learningGoal,
        updatedAt: new Date()
      }, { merge: true });

      console.log('✅ Profile saved');
      showMessage('Profile updated successfully');
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      showMessage('Failed to save profile', true);
    } finally {
      setSaving(false);
    }
  };

  // 保存 Preferences
  const handleSavePreferences = async () => {
    if (!user) {
      showMessage('Please login first', true);
      return;
    }

    try {
      setSaving(true);
      console.log('💾 Saving preferences...');

      const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
      await setDoc(settingsRef, {
        soundEffects,
        autoplay,
        darkMode,
        updatedAt: new Date()
      }, { merge: true });

      console.log('✅ Preferences saved');
      showMessage('Preferences updated successfully');
    } catch (error) {
      console.error('❌ Error saving preferences:', error);
      showMessage('Failed to save preferences', true);
    } finally {
      setSaving(false);
    }
  };

  // 修改密码
  const handleChangePassword = async () => {
    if (!user || !user.email) {
      showMessage('User not found', true);
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage('Please fill in all password fields', true);
      return;
    }

    if (newPassword.length < 6) {
      showMessage('New password must be at least 6 characters', true);
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('New passwords do not match', true);
      return;
    }

    try {
      setChangingPassword(true);
      console.log('🔐 Changing password...');

      // 重新认证
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // 更新密码
      await updatePassword(user, newPassword);

      // 清空输入
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      console.log('✅ Password changed');
      showMessage('Password updated successfully');
    } catch (error: any) {
      console.error('❌ Error changing password:', error);
      
      if (error.code === 'auth/wrong-password') {
        showMessage('Current password is incorrect', true);
      } else if (error.code === 'auth/requires-recent-login') {
        showMessage('Please sign out and sign in again', true);
      } else {
        showMessage('Failed to change password: ' + error.message, true);
      }
    } finally {
      setChangingPassword(false);
    }
  };

  // Reset Progress
  const handleResetProgress = async () => {
    if (!user) {
      showMessage('Please login first', true);
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to reset all your learning progress? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      console.log('🔄 Resetting progress...');

      // Reset userProgress
      const progressRef = doc(db, 'userProgress', user.uid);
      await setDoc(progressRef, {
        userId: user.uid,
        level: 'A1',
        xp: 0,
        totalLessonsCompleted: 0,
        completedLessons: [],
        moduleProgress: {},
        streak: {
          current: 0,
          longest: 0,
          lastActiveDate: '',
        },
        lastUpdated: new Date(),
      }, { merge: true });

      // Reset stats
      const statsRef = doc(db, 'users', user.uid, 'stats', 'overall');
      await setDoc(statsRef, {
        totalPoints: 0,
        achievementsUnlocked: 0,
        weeklyXP: 0
      });

      const streakRef = doc(db, 'users', user.uid, 'stats', 'streak');
      await setDoc(streakRef, {
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: null,
        streakHistory: []
      });

      console.log('✅ Progress reset');
      showMessage('Progress has been reset');
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('❌ Error resetting progress:', error);
      showMessage('Failed to reset progress', true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display font-bold text-2xl">Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-6">Profile Information</h3>
              
              {/* Avatar */}
              <div className="flex items-center gap-6 mb-8">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    {displayName?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-lg">{displayName || 'User'}</h4>
                  <p className="text-sm text-muted-foreground">{email}</p>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Form */}
              <div className="grid gap-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input 
                      id="displayName" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      value={email} 
                      disabled 
                      className="bg-muted" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input 
                    id="bio" 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                {/* <div className="space-y-2">
                  <Label htmlFor="learningGoal">Learning Goal</Label>
                  <select
                    id="learningGoal"
                    value={learningGoal}
                    onChange={(e) => setLearningGoal(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="fluency">General Fluency</option>
                    <option value="business">Business English</option>
                    <option value="academic">Academic English</option>
                    <option value="travel">Travel & Conversation</option>
                    <option value="exam">Exam Preparation</option>
                  </select>
                </div> */}

                {/* Learning Goals */}
                <div className="space-y-2">
                  <Label>Your Learning Goals</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedGoals.map((goalId) => {
                      const Icon = goalIcons[goalId] || BookOpen;
                      const label = goalLabels[goalId] || goalId;
                      
                      return (
                        <div
                          key={goalId}
                          className="flex items-center gap-2 p-3 rounded-lg border border-primary/30 bg-primary/5"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium truncate">{label}</span>
                        </div>
                      );
                    })}
                  </div>
                  {selectedGoals.length === 0 && (
                    <p className="text-sm text-muted-foreground">No learning goals selected</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                  ) : (
                    <><Check className="w-4 h-4" />Save Changes</>
                  )}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-6">Learning Preferences</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Sound Effects</h4>
                      <p className="text-sm text-muted-foreground">Play sounds for answers</p>
                    </div>
                  </div>
                  <Switch checked={soundEffects} onCheckedChange={setSoundEffects} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">Auto-play Audio</h4>
                      <p className="text-sm text-muted-foreground">Auto play in exercises</p>
                    </div>
                  </div>
                  <Switch checked={autoplay} onCheckedChange={setAutoplay} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    <div>
                      <h4 className="font-medium">Dark Mode</h4>
                      <p className="text-sm text-muted-foreground">Use dark theme</p>
                    </div>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={handleSavePreferences} disabled={saving} className="gap-2">
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                  ) : (
                    <><Check className="w-4 h-4" />Save Changes</>
                  )}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-6">Account Security</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <Input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleChangePassword} disabled={changingPassword}>
                    {changingPassword ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" />Updating...</>
                    ) : (
                      <><Shield className="w-4 h-4 mr-2" />Update Password</>
                    )}
                  </Button>
                </div>
              </Card>

              <Card className="p-6 border-amber-500/30">
                <h3 className="font-semibold text-lg mb-4">Reset Progress</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Reset all learning progress. Cannot be undone.
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleResetProgress}
                  disabled={saving}
                  className="border-amber-500/50 text-amber-500"
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />Resetting...</>
                  ) : (
                    'Reset Progress'
                  )}
                </Button>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}