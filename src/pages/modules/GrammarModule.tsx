import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Play, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const lessons = [
  { id: 'grammar-1', title: 'Present Simple Tense', duration: '15 min', completed: true, hasContent: true },
  { id: 'grammar-2', title: 'Present Continuous Tense', duration: '18 min', completed: true, hasContent: true },
  { id: 3, title: 'Past Simple Tense', duration: '20 min', completed: true },
  { id: 4, title: 'Past Continuous Tense', duration: '15 min', completed: true },
  { id: 5, title: 'Present Perfect Tense', duration: '22 min', completed: true },
  { id: 6, title: 'Past Perfect Tense', duration: '18 min', completed: true },
  { id: 7, title: 'Future Simple Tense', duration: '15 min', completed: true },
  { id: 8, title: 'Future Continuous Tense', duration: '20 min', completed: true },
  { id: 'grammar-9', title: 'Conditional Sentences (Type 1)', duration: '25 min', completed: false, hasContent: true },
  { id: 10, title: 'Conditional Sentences (Type 2)', duration: '25 min', completed: false, locked: true },
  { id: 11, title: 'Conditional Sentences (Type 3)', duration: '25 min', completed: false, locked: true },
  { id: 12, title: 'Modal Verbs', duration: '30 min', completed: false, locked: true },
];

export default function GrammarModule() {
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shrink-0">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold mb-2">Grammar Fundamentals</h1>
              <p className="text-gray-400 mb-4">Master English grammar rules and structures</p>
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-xs">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{completedCount} of {lessons.length} lessons</span>
                    <span className="text-cyan-400 font-medium">{progress}%</span>
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
                  navigate(`/modules/grammar/lesson/${lesson.id}`);
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
                  : 'bg-cyan-500/20 text-cyan-400'
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
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/modules/grammar/lesson/${lesson.id}`);
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
                    navigate(`/modules/grammar/lesson/${lesson.id}`);
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
