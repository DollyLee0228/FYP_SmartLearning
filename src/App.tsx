// App.tsx - 终极正确版本
import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LearningProvider } from "@/context/LearningContext";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';

import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import { LevelAssessment } from "./components/LevelAssessment";
import Dashboard from "./pages/Dashboard";
import GrammarModule from "./pages/modules/GrammarModule";
import VocabularyModule from "./pages/modules/VocabularyModule";
import ReadingModule from "./pages/modules/ReadingModule";
import ListeningModule from "./pages/modules/ListeningModule";
import WritingModule from "./pages/modules/WritingModule";
import SpeakingModule from "./pages/modules/SpeakingModule";
import LessonPage from "./pages/LessonPage";
import LearningGoalsPage from "./pages/LearningGoalsPage";
import VideosPage from "./pages/VideosPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import AchievementsPage from "./pages/AchievementsPage";
import SettingsPage from "./pages/SettingsPage";
import AdminDashboard from '@/pages/admin/AdminDashboard';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ 只在 App 级别检查一次 auth
  useEffect(() => {
    console.log('🔍 App: Setting up auth listener (ONCE)');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('👤 Auth state:', user ? 'logged in' : 'logged out');
      setIsAuthenticated(!!user);
      setAuthChecked(true);
    });

    return () => {
      console.log('🧹 Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  // ✅ 显示 loading 直到 auth 检查完成
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-purple-950/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LearningProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* ✅ Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/quiz" element={<LevelAssessment />} />
              
              {/* ✅ Auth Route - 已登录则重定向 */}
              <Route 
                path="/auth" 
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage />} 
              />
              
              {/* ✅ Protected Routes - 未登录则重定向到 /auth */}
              <Route 
                path="/dashboard" 
                element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" replace />} 
              />
              
              <Route 
                path="/modules/grammar" 
                element={isAuthenticated ? <GrammarModule /> : <Navigate to="/auth" replace />} 
              />
              
              <Route 
                path="/modules/vocabulary" 
                element={isAuthenticated ? <VocabularyModule /> : <Navigate to="/auth" replace />} 
              />
              
              <Route 
                path="/modules/reading" 
                element={isAuthenticated ? <ReadingModule /> : <Navigate to="/auth" replace />} 
              />
              
              <Route 
                path="/modules/listening" 
                element={isAuthenticated ? <ListeningModule /> : <Navigate to="/auth" replace />} 
              />
              
              <Route 
                path="/modules/writing" 
                element={isAuthenticated ? <WritingModule /> : <Navigate to="/auth" replace />} 
              />
              
              <Route 
                path="/modules/speaking" 
                element={isAuthenticated ? <SpeakingModule /> : <Navigate to="/auth" replace />} 
              />
              
              <Route 
                path="/lesson/:moduleId/:lessonId" 
                element={isAuthenticated ? <LessonPage /> : <Navigate to="/auth" replace />} 
              />
              
              <Route 
                path="/videos" 
                element={isAuthenticated ? <VideosPage /> : <Navigate to="/auth" replace />} 
              />
              
              <Route 
                path="/recommendations" 
                element={isAuthenticated ? <RecommendationsPage /> : <Navigate to="/auth" replace />} 
              />
              
              <Route 
                path="/learning-goals" 
                element={isAuthenticated ? <LearningGoalsPage /> : <Navigate to="/auth" replace />} 
              />
              
              <Route 
                path="/achievements" 
                element={isAuthenticated ? <AchievementsPage /> : <Navigate to="/auth" replace />} 
              />
              
              <Route 
                path="/settings" 
                element={isAuthenticated ? <SettingsPage /> : <Navigate to="/auth" replace />} 
              />
              
              <Route 
                path="/admin" 
                element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/auth" replace />} 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LearningProvider>
    </QueryClientProvider>
  );
}

export default App;