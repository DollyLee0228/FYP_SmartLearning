import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Library, Play, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const lessons = [
  { id: 'vocabulary-1', title: 'Everyday Essentials', duration: '20 min', completed: true, hasContent: true },
  { id: 2, title: 'Family & Relationships', duration: '18 min', completed: true },
  { id: 3, title: 'Food & Dining', duration: '22 min', completed: true },
  { id: 4, title: 'Travel & Transportation', duration: '20 min', completed: true },
  { id: 5, title: 'Work & Professions', duration: '25 min', completed: true },
  { id: 6, title: 'Health & Wellness', duration: '18 min', completed: true },
  { id: 7, title: 'Shopping & Money', duration: '20 min', completed: true },
  { id: 8, title: 'Entertainment & Hobbies', duration: '22 min', completed: true },
  { id: 9, title: 'Technology & Internet', duration: '25 min', completed: true },
  { id: 10, title: 'Environment & Nature', duration: '20 min', completed: true },
  { id: 11, title: 'Education & Learning', duration: '22 min', completed: true },
  { id: 12, title: 'Business Vocabulary', duration: '30 min', completed: true },
  { id: 13, title: 'Academic Words', duration: '25 min', completed: false },
  { id: 14, title: 'Idioms & Expressions', duration: '28 min', completed: false, locked: true },
  { id: 15, title: 'Phrasal Verbs', duration: '30 min', completed: false, locked: true },
];

export default function VocabularyModule() {
  const navigate = useNavigate();
  const completedCount = lessons.filter(l => l.completed).length;
  const progress = Math.round((completedCount / lessons.length) * 100);

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Header */}
      <div className="bg-[#111827] border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shrink-0">
              <Library className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold mb-2">Vocabulary Builder</h1>
              <p className="text-gray-400 mb-4">Expand your word power with contextual learning</p>
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-xs">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{completedCount} of {lessons.length} lessons</span>
                    <span className="text-purple-400 font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-lg font-semibold mb-6">Lessons</h2>
        <div className="space-y-3">
          {lessons.map((lesson, index) => (
            <motion.div
              key={String(lesson.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                if (!lesson.locked && lesson.hasContent) {
                  navigate(`/modules/vocabulary/lesson/${lesson.id}`);
                }
              }}
              className={`bg-[#111827] rounded-xl border border-white/10 p-4 flex items-center gap-4 ${
                lesson.locked ? 'opacity-50' : 'hover:border-white/20 cursor-pointer'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                lesson.completed
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : lesson.locked
                  ? 'bg-white/5 text-gray-500'
                  : 'bg-purple-500/20 text-purple-400'
              }`}>
                {lesson.completed ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : lesson.locked ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-semibold">{typeof lesson.id === 'number' ? lesson.id : index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">{lesson.title}</h3>
                <p className="text-sm text-gray-500">{lesson.duration}</p>
              </div>
              {!lesson.locked && !lesson.completed && lesson.hasContent && (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/modules/vocabulary/lesson/${lesson.id}`);
                  }}
                >
                  <Play className="w-4 h-4 mr-1" />
                  Start
                </Button>
              )}
              {!lesson.locked && !lesson.completed && !lesson.hasContent && (
                <span className="text-xs text-gray-500">Coming soon</span>
              )}
              {lesson.completed && lesson.hasContent && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/10 text-gray-400 hover:bg-white/5"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/modules/vocabulary/lesson/${lesson.id}`);
                  }}
                >
                  Review
                </Button>
              )}
              {lesson.completed && !lesson.hasContent && (
                <span className="text-xs text-emerald-400">Completed</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
