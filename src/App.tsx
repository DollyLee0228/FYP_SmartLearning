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
// import ReadingExercisePage from "./pages/modules/ReadingExercisePage";
// import ReadingLessonPage from './pages/modules/ReadingLessonPage';
// import WritingExercisePage from "./pages/modules/WritingExercisePage";
// import SpeakingExercisePage from "./pages/modules/SpeakingExercisePage";
// import ListeningExercisePage from "./pages/modules/ListeningExercisePage";
import VideosPage from "./pages/VideosPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import AchievementsPage from "./pages/AchievementsPage";
import SettingsPage from "./pages/SettingsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotificationsPage from "./pages/NotificationsPage";
import NotFound from "./pages/NotFound";
// import ImportListeningLessons_Part1 from "./pages/ImportListeningLessons_Part1";
import ImportLesson from "./pages/importLessons";

const queryClient = new QueryClient();

// FIX: Correct structure with proper JSX return
function App() {
  return (
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
              <Route path="/lesson/:moduleId/:lessonId" element={<LessonPage />} />
              {/* <Route path="/exercises/reading/:exerciseId" element={<ReadingExercisePage />} /> */}
              {/* <Route path="/lesson/reading/:lessonId" element={<ReadingLessonPage />} /> */}
              {/* <Route path="/exercises/writing/:exerciseId" element={<WritingExercisePage />} /> */}
              {/* <Route path="/exercises/speaking/:exerciseId" element={<SpeakingExercisePage />} /> */}
              {/* <Route path="/exercises/listening/:exerciseId" element={<ListeningExercisePage />} /> */}
              <Route path="/videos" element={<VideosPage />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="*" element={<NotFound />} />
              {/* <Route path="/import-listening-part1" element={<ImportListeningLessons_Part1 />} /> */}
              <Route path="/import-lesson" element={<ImportLesson />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LearningProvider>
    </QueryClientProvider>
  );
}

export default App;
