import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLearning } from '@/context/LearningContext';
import { LEVELS } from '@/types/learning';
import {
  ArrowLeft, User, Bell, Shield, Palette, Globe, Volume2, 
  Moon, Sun, Trash2, Camera, Save, RefreshCw
} from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { userProgress, resetProgress } = useLearning();
  const levelInfo = userProgress ? LEVELS[userProgress.level] : null;

  // Settings state
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    streakAlerts: true,
    newContent: true,
    achievements: true,
    email: false,
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    dailyGoal: '15',
    soundEffects: true,
    autoplay: true,
    darkMode: true,
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleResetProgress = () => {
    resetProgress();
    toast({
      title: "Progress reset",
      description: "Your learning progress has been reset.",
      variant: "destructive",
    });
  };

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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-6">Profile Information</h3>
                
                {/* Avatar Section */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{user?.email?.split('@')[0] || 'User'}</h4>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${levelInfo?.color === 'emerald' ? 'from-emerald-500 to-green-600' : 'from-primary to-accent'} text-white`}>
                        Level {userProgress?.level || 'A1'}
                      </span>
                      <span className="text-sm text-muted-foreground">{userProgress?.xp || 0} XP</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Form Fields */}
                <div className="grid gap-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input id="displayName" placeholder="Enter your name" defaultValue={user?.email?.split('@')[0]} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={user?.email || ''} disabled className="bg-muted" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input id="bio" placeholder="Tell us about yourself..." />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nativeLanguage">Native Language</Label>
                      <Select defaultValue="zh">
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zh">Chinese (中文)</SelectItem>
                          <SelectItem value="es">Spanish (Español)</SelectItem>
                          <SelectItem value="ja">Japanese (日本語)</SelectItem>
                          <SelectItem value="ko">Korean (한국어)</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="learningGoal">Learning Goal</Label>
                      <Select defaultValue="fluency">
                        <SelectTrigger>
                          <SelectValue placeholder="Select goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fluency">General Fluency</SelectItem>
                          <SelectItem value="business">Business English</SelectItem>
                          <SelectItem value="academic">Academic English</SelectItem>
                          <SelectItem value="travel">Travel & Conversation</SelectItem>
                          <SelectItem value="exam">Exam Preparation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button onClick={handleSave} className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-6">Notification Settings</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Daily Reminder</h4>
                      <p className="text-sm text-muted-foreground">Get a daily reminder to practice</p>
                    </div>
                    <Switch 
                      checked={notifications.dailyReminder}
                      onCheckedChange={(checked) => setNotifications({...notifications, dailyReminder: checked})}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Streak Alerts</h4>
                      <p className="text-sm text-muted-foreground">Get notified before losing your streak</p>
                    </div>
                    <Switch 
                      checked={notifications.streakAlerts}
                      onCheckedChange={(checked) => setNotifications({...notifications, streakAlerts: checked})}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">New Content</h4>
                      <p className="text-sm text-muted-foreground">Get notified when new lessons are available</p>
                    </div>
                    <Switch 
                      checked={notifications.newContent}
                      onCheckedChange={(checked) => setNotifications({...notifications, newContent: checked})}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Achievement Unlocked</h4>
                      <p className="text-sm text-muted-foreground">Get notified when you earn achievements</p>
                    </div>
                    <Switch 
                      checked={notifications.achievements}
                      onCheckedChange={(checked) => setNotifications({...notifications, achievements: checked})}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive weekly progress reports via email</p>
                    </div>
                    <Switch 
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button onClick={handleSave} className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-6">Learning Preferences</h3>
                
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Daily Learning Goal</Label>
                      <Select 
                        value={preferences.dailyGoal}
                        onValueChange={(value) => setPreferences({...preferences, dailyGoal: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 minutes / day</SelectItem>
                          <SelectItem value="10">10 minutes / day</SelectItem>
                          <SelectItem value="15">15 minutes / day</SelectItem>
                          <SelectItem value="30">30 minutes / day</SelectItem>
                          <SelectItem value="60">1 hour / day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Interface Language</Label>
                      <Select 
                        value={preferences.language}
                        onValueChange={(value) => setPreferences({...preferences, language: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="zh">中文</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Sound Effects</h4>
                        <p className="text-sm text-muted-foreground">Play sounds for correct/incorrect answers</p>
                      </div>
                    </div>
                    <Switch 
                      checked={preferences.soundEffects}
                      onCheckedChange={(checked) => setPreferences({...preferences, soundEffects: checked})}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Auto-play Audio</h4>
                        <p className="text-sm text-muted-foreground">Automatically play audio in listening exercises</p>
                      </div>
                    </div>
                    <Switch 
                      checked={preferences.autoplay}
                      onCheckedChange={(checked) => setPreferences({...preferences, autoplay: checked})}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {preferences.darkMode ? <Moon className="w-5 h-5 text-muted-foreground" /> : <Sun className="w-5 h-5 text-muted-foreground" />}
                      <div>
                        <h4 className="font-medium">Dark Mode</h4>
                        <p className="text-sm text-muted-foreground">Use dark theme throughout the app</p>
                      </div>
                    </div>
                    <Switch 
                      checked={preferences.darkMode}
                      onCheckedChange={(checked) => setPreferences({...preferences, darkMode: checked})}
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button onClick={handleSave} className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-6">Account Security</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" placeholder="Enter current password" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input type="password" placeholder="Enter new password" />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm New Password</Label>
                      <Input type="password" placeholder="Confirm new password" />
                    </div>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Shield className="w-4 h-4" />
                    Update Password
                  </Button>
                </div>
              </Card>

              <Card className="p-6 border-amber-500/30">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-amber-500" />
                  Reset Learning Progress
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This will reset all your learning progress, achievements, and streak data. This action cannot be undone.
                </p>
                <Button variant="outline" onClick={handleResetProgress} className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10">
                  Reset Progress
                </Button>
              </Card>

              <Card className="p-6 border-destructive/30">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-destructive">
                  <Trash2 className="w-5 h-5" />
                  Danger Zone
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </Button>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
