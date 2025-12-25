import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LearningProvider } from "@/context/LearningContext";
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
import ReadingExercisePage from "./pages/modules/ReadingExercisePage";
import WritingExercisePage from "./pages/modules/WritingExercisePage";
import SpeakingExercisePage from "./pages/modules/SpeakingExercisePage";
import ListeningExercisePage from "./pages/modules/ListeningExercisePage";
import VideosPage from "./pages/VideosPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import AchievementsPage from "./pages/AchievementsPage";
import SettingsPage from "./pages/SettingsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotificationsPage from "./pages/NotificationsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LearningProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/quiz" element={<LevelAssessment />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/modules/grammar" element={<GrammarModule />} />
            <Route path="/modules/vocabulary" element={<VocabularyModule />} />
            <Route path="/modules/reading" element={<ReadingModule />} />
            <Route path="/modules/listening" element={<ListeningModule />} />
            <Route path="/modules/writing" element={<WritingModule />} />
            <Route path="/modules/speaking" element={<SpeakingModule />} />
            <Route path="/modules/:moduleId/lesson/:lessonId" element={<LessonPage />} />
            <Route path="/modules/reading/exercise/:exerciseId" element={<ReadingExercisePage />} />
            <Route path="/modules/writing/exercise/:exerciseId" element={<WritingExercisePage />} />
            <Route path="/modules/speaking/exercise/:lessonId" element={<SpeakingExercisePage />} />
            <Route path="/modules/listening/exercise/:lessonId" element={<ListeningExercisePage />} />
            <Route path="/videos" element={<VideosPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LearningProvider>
  </QueryClientProvider>
);

export default App;
