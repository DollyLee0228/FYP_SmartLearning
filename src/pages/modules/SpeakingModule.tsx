import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, Play, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const exercises = [
  { id: 'speaking-1', title: 'Basic Pronunciation', description: '基础问候语发音练习', duration: '5 题', completed: false, hasContent: true },
  { id: 'speaking-2', title: 'Vowel Sounds', description: '元音发音练习', duration: '5 题', completed: false, hasContent: true },
  { id: 'speaking-3', title: 'Consonant Sounds', description: '辅音发音练习', duration: '5 题', completed: false },
  { id: 'speaking-4', title: 'Word Stress', description: '单词重音练习', duration: '5 题', completed: false, locked: true },
  { id: 'speaking-5', title: 'Sentence Intonation', description: '句子语调练习', duration: '5 题', completed: false, locked: true },
];

export default function SpeakingModule() {
  const navigate = useNavigate();
  const completedCount = exercises.filter(e => e.completed).length;
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center shrink-0">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold mb-2">Speaking & Pronunciation</h1>
              <p className="text-gray-400 mb-4">使用麦克风练习发音，AI实时评分</p>
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-xs">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{completedCount} of {exercises.length} 练习</span>
                    <span className="text-rose-400 font-medium">{progress}%</span>
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
        <h2 className="text-lg font-semibold mb-6">发音练习</h2>
        <div className="space-y-3">
          {exercises.map((exercise, index) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                if (!exercise.locked && exercise.hasContent) {
                  navigate(`/modules/speaking/exercise/${exercise.id}`);
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
                  : 'bg-rose-500/20 text-rose-400'
              }`}>
                {exercise.completed ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : exercise.locked ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">{exercise.title}</h3>
                <p className="text-sm text-gray-500">{exercise.description} • {exercise.duration}</p>
              </div>
              {!exercise.locked && exercise.hasContent && (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/modules/speaking/exercise/${exercise.id}`);
                  }}
                >
                  <Play className="w-4 h-4 mr-1" />
                  开始
                </Button>
              )}
              {!exercise.locked && !exercise.hasContent && (
                <span className="text-xs text-gray-500">即将推出</span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Mic className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-rose-300 font-medium">需要麦克风权限</p>
              <p className="text-sm text-gray-400 mt-1">
                练习时会使用浏览器的语音识别功能，请确保允许麦克风权限。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
