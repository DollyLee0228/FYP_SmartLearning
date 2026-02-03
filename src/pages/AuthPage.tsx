// AuthPage.tsx - 修复版
// ✅ 登录后检查learningGoalsCompleted，决定跳转到Learning Goals或Dashboard

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Sparkles, Mail, Lock, User, Award } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

interface PendingQuizData {
  level: string;
  score: number;
  totalQuestions: number;
  timeTaken?: number;
  answers?: any[];
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [pendingQuizData, setPendingQuizData] = useState<PendingQuizData | null>(null);

  useEffect(() => {
    // Check for pending quiz data
    const pendingLevel = localStorage.getItem('smartlearning_pending_level');
    const pendingScore = localStorage.getItem('smartlearning_pending_score');
    const pendingTotal = localStorage.getItem('smartlearning_pending_total');
    const pendingTime = localStorage.getItem('smartlearning_pending_time');
    const pendingAnswers = localStorage.getItem('smartlearning_pending_answers');

    if (pendingLevel && pendingScore) {
      setPendingQuizData({
        level: pendingLevel,
        score: parseInt(pendingScore),
        totalQuestions: pendingTotal ? parseInt(pendingTotal) : 30,
        timeTaken: pendingTime ? parseInt(pendingTime) : undefined,
        answers: pendingAnswers ? JSON.parse(pendingAnswers) : undefined
      });
    }

    // Check if user is already logged in
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await checkUserRoleAndRedirect(user.uid);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const saveQuizResultsToFirestore = async (
    userId: string, 
    quizData: PendingQuizData
  ) => {
    try {
      const percentage = (quizData.score / quizData.totalQuestions) * 100;

      // Save quiz result to quizResults collection
      await addDoc(collection(db, 'quizResults'), {
        userId,
        quizType: 'level_assessment',
        score: quizData.score,
        totalQuestions: quizData.totalQuestions,
        percentage: Math.round(percentage * 100) / 100,
        determinedLevel: quizData.level,
        answers: quizData.answers || [],
        timeTaken: quizData.timeTaken || 0,
        completedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });

      // Update user profile with assessment data
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        level: quizData.level,
        assessmentCompleted: true,
        assessmentScore: quizData.score,
        assessmentDate: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      console.log('Quiz results saved successfully to Firestore');
      toast.success('Your quiz results have been saved!');
    } catch (error) {
      console.error('Error saving quiz results:', error);
      toast.error('Failed to save quiz results. Please try again.');
      throw error;
    }
  };

  const createUserProfile = async (
    userId: string, 
    email: string, 
    displayName: string,
    role: string = 'user'
  ) => {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        userId,
        email,
        displayName,
        role,
        level: 'A1',
        assessmentCompleted: false,
        learningGoalsCompleted: false, // ✅ 添加这个字段
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('User profile created successfully');
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  // ✅ 修复的核心函数
  const checkUserRoleAndRedirect = async (userId: string) => {
    try {
      console.log('🔍 Checking user status for:', userId);
      
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      // Admin check
      if (userDoc.exists() && userDoc.data()?.role === 'admin') {
        console.log('✅ Admin user, redirecting to /admin');
        navigate('/admin', { replace: true });
        return;
      }
      
      // ✅ 检查是否完成了learning goals
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const learningGoalsCompleted = userData.learningGoalsCompleted || false;
        
        console.log('📊 User status:', {
          learningGoalsCompleted,
          assessmentCompleted: userData.assessmentCompleted
        });
        
        if (learningGoalsCompleted) {
          // 已完成learning goals → Dashboard
          console.log('✅ Learning goals completed, redirecting to /dashboard');
          navigate('/dashboard', { replace: true });
        } else {
          // 未完成learning goals → Learning Goals Page
          console.log('⏳ Learning goals not completed, redirecting to /learning-goals');
          navigate('/learning-goals', { replace: true });
        }
      } else {
        // 新用户，没有profile → Learning Goals Page
        console.log('🆕 New user without profile, redirecting to /learning-goals');
        navigate('/learning-goals', { replace: true });
      }
      
    } catch (error) {
      console.error('Error checking user role:', error);
      // 发生错误，默认跳转到learning goals
      navigate('/learning-goals', { replace: true });
    }
  };

  const validateInputs = (): boolean => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) return;
    
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Signed in successfully!');
      
      // ✅ 登录成功后检查并跳转
      await checkUserRoleAndRedirect(userCredential.user.uid);
      
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        toast.error('Invalid email or password');
      } else {
        toast.error(error.message || 'An error occurred during sign in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) return;
    
    if (!displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    setIsLoading(true);
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName });

      // Create user profile in Firestore
      await createUserProfile(user.uid, email, displayName);

      // Save quiz results if pending
      if (pendingQuizData) {
        await saveQuizResultsToFirestore(user.uid, pendingQuizData);
        
        // Don't clear localStorage yet, let LearningGoalsPage handle it
        console.log('✅ Quiz results saved, quiz data will be used in Learning Goals Page');
      }
      
      toast.success('Account created successfully!');
      
      // ✅ 注册成功后，新用户一定跳转到Learning Goals Page
      navigate('/learning-goals', { replace: true });
      
    } catch (error: any) {
      console.error('Sign up error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('An account with this email already exists. Please sign in instead.');
      } else {
        toast.error(error.message || 'An error occurred during sign up');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Check if user profile exists, create if not
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // 新用户，创建profile
        await createUserProfile(
          user.uid, 
          user.email || '', 
          user.displayName || 'User'
        );
        
        // Save quiz results if pending
        if (pendingQuizData) {
          await saveQuizResultsToFirestore(user.uid, pendingQuizData);
        }
        
        // 新用户 → Learning Goals Page
        toast.success('Welcome! Please select your learning goals.');
        navigate('/learning-goals', { replace: true });
      } else {
        // 老用户，检查并跳转
        toast.success('Signed in with Google successfully!');
        await checkUserRoleAndRedirect(user.uid);
      }
      
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">Smart Learning</h1>
            <p className="text-sm text-muted-foreground">AI-Powered English</p>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-foreground">Welcome</CardTitle>
            <CardDescription className="text-gray-400">
            {pendingQuizData ? (
              <div className="flex items-center justify-center gap-2 text-cyan-400">
                <Award className="w-4 h-4" />
                <span>Quiz completed! Level: {pendingQuizData.level} ({pendingQuizData.score}/{pendingQuizData.totalQuestions})</span>
              </div>
            ) : (
              'Sign in to your account or create a new one'
            )}
          </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-background border-border"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-background border-border"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Display Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="pl-10 bg-background border-border"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-background border-border"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password (min 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-background border-border"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                  
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 text-center">
              <Button variant="ghost" onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground">
                ← Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}