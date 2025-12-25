import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Play, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const exercises = [
  { id: 'reading-1', title: 'The Little Prince - Excerpt', duration: '20 min', completed: false, type: 'Story' },
  { id: 'reading-2', title: 'Climate Change and Its Effects', duration: '25 min', completed: false, type: 'Article' },
  { id: 3, title: 'A Day in London', duration: '15 min', completed: false, type: 'Travel', locked: true },
  { id: 4, title: 'The History of Coffee', duration: '20 min', completed: false, type: 'History', locked: true },
  { id: 5, title: 'Technology in Education', duration: '25 min', completed: false, type: 'Technology', locked: true },
  { id: 6, title: 'Health and Wellness Tips', duration: '18 min', completed: false, type: 'Health', locked: true },
];

export default function ReadingModule() {
  const navigate = useNavigate();
  const completedCount = exercises.filter(l => l.completed).length;
  const progress = Math.round((completedCount / exercises.length) * 100);

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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shrink-0">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold mb-2">Reading Comprehension</h1>
              <p className="text-gray-400 mb-4">Read passages and answer questions to improve comprehension</p>
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-xs">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{completedCount} of {exercises.length} exercises</span>
                    <span className="text-blue-400 font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exercises List */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-lg font-semibold mb-6">Reading Exercises</h2>
        <div className="space-y-3">
          {exercises.map((exercise, index) => (
            <motion.div
              key={String(exercise.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                if (!exercise.locked && typeof exercise.id === 'string') {
                  navigate(`/modules/reading/exercise/${exercise.id}`);
                }
              }}
              className={`bg-[#111827] rounded-xl border border-white/10 p-4 flex items-center gap-4 ${
                exercise.locked ? 'opacity-50' : 'hover:border-white/20 cursor-pointer'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                exercise.completed
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : exercise.locked
                  ? 'bg-white/5 text-gray-500'
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {exercise.completed ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : exercise.locked ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">{exercise.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{exercise.type}</span>
                  <span>•</span>
                  <span>{exercise.duration}</span>
                </div>
              </div>
              {!exercise.locked && typeof exercise.id === 'string' && (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/modules/reading/exercise/${exercise.id}`);
                  }}
                >
                  <Play className="w-4 h-4 mr-1" />
                  Start
                </Button>
              )}
              {exercise.locked && (
                <span className="text-xs text-gray-500">Coming soon</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
