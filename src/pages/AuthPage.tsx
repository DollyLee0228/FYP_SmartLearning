// AuthPage.tsx - 简化版（移除所有 auth 检查逻辑）
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Brain, Mail, Lock, User, Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { auth, db } from '@/config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const googleProvider = new GoogleAuthProvider();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // 保存quiz结果
  const saveQuizResults = async (userId: string) => {
    const pendingLevel = localStorage.getItem('smartlearning_pending_level');
    const pendingScore = localStorage.getItem('smartlearning_pending_score');
    
    if (!pendingLevel || !pendingScore) return;

    try {
      const pendingTotal = localStorage.getItem('smartlearning_pending_total');
      const pendingTime = localStorage.getItem('smartlearning_pending_time');
      const pendingAnswers = localStorage.getItem('smartlearning_pending_answers');

      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        level: pendingLevel,
        quizLevel: pendingLevel,
        quizScore: parseInt(pendingScore),
        assessmentCompleted: true,
        assessmentScore: parseInt(pendingScore),
        assessmentDate: serverTimestamp()
      }, { merge: true });

      if (pendingAnswers) {
        const quizResultRef = doc(db, 'quizResults', `${userId}_${Date.now()}`);
        await setDoc(quizResultRef, {
          userId,
          quizType: 'level_assessment',
          score: parseInt(pendingScore),
          totalQuestions: pendingTotal ? parseInt(pendingTotal) : 30,
          percentage: Math.round((parseInt(pendingScore) / (pendingTotal ? parseInt(pendingTotal) : 30)) * 100),
          determinedLevel: pendingLevel,
          answers: JSON.parse(pendingAnswers),
          timeTaken: pendingTime ? parseInt(pendingTime) : 0,
          completedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });
      }

      localStorage.removeItem('smartlearning_pending_level');
      localStorage.removeItem('smartlearning_pending_score');
      localStorage.removeItem('smartlearning_pending_total');
      localStorage.removeItem('smartlearning_pending_time');
      localStorage.removeItem('smartlearning_pending_answers');
    } catch (error) {
      console.error('Failed to save quiz:', error);
    }
  };

  const createUserProfile = async (userId: string, userEmail: string, userName: string) => {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      uid: userId,
      email: userEmail,
      displayName: userName,
      role: 'student',
      createdAt: serverTimestamp(),
      learningGoalsCompleted: false
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(userCredential.user.uid, email, displayName);
      await saveQuizResults(userCredential.user.uid);
      
      toast.success('Account created!');
      navigate('/learning-goals');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await saveQuizResults(userCredential.user.uid);
      
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        navigate('/learning-goals');
      } else {
        const userData = userDoc.data();
        if (userData.role === 'admin') {
          navigate('/admin');
        } else if (userData.learningGoalsCompleted) {
          navigate('/dashboard');
        } else {
          navigate('/learning-goals');
        }
      }
      
      toast.success('Welcome back!');
    } catch (error: any) {
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const userRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await createUserProfile(result.user.uid, result.user.email || '', result.user.displayName || 'User');
        await saveQuizResults(result.user.uid);
        navigate('/learning-goals');
      } else {
        await saveQuizResults(result.user.uid);
        const userData = userDoc.data();
        if (userData.role === 'admin') {
          navigate('/admin');
        } else if (userData.learningGoalsCompleted) {
          navigate('/dashboard');
        } else {
          navigate('/learning-goals');
        }
      }
      
      toast.success('Welcome!');
    } catch (error: any) {
      toast.error('Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 shadow-2xl">
        <CardContent className="p-8">
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
            >
              <Brain className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Smart Learning
            </h1>
            <p className="text-sm text-muted-foreground mt-1">AI-Powered English Learning</p>
          </div>

          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                !isSignUp
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                isSignUp
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isSignUp ? 'signup' : 'signin'}
              initial={{ opacity: 0, x: isSignUp ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isSignUp ? -20 : 20 }}
              transition={{ duration: 0.2 }}
              onSubmit={isSignUp ? handleSignUp : handleSignIn}
              className="space-y-4"
            >
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Display Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-background"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </>
                )}
              </Button>
            </motion.form>
          </AnimatePresence>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              OR CONTINUE WITH
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </Button>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 mx-auto"
            >
              ← Back to Home
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}