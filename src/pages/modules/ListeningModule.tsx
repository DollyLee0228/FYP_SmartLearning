import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Headphones, Play, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const exercises = [
  { id: 'listening-1', title: 'Basic Conversations', description: '听基础对话，回答问题', duration: '5 题', completed: false, hasContent: true },
  { id: 'listening-2', title: 'Phone Calls & Messages', description: '听电话和留言内容', duration: '5 题', completed: false, hasContent: true },
  { id: 'listening-3', title: 'Announcements', description: '听公告和通知', duration: '5 题', completed: false },
  { id: 'listening-4', title: 'News Broadcasts', description: '听新闻广播', duration: '5 题', completed: false, locked: true },
  { id: 'listening-5', title: 'Lectures', description: '听讲座和演讲', duration: '5 题', completed: false, locked: true },
];

export default function ListeningModule() {
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shrink-0">
              <Headphones className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold mb-2">Listening Skills</h1>
              <p className="text-gray-400 mb-4">听音频，选择或输入你听到的内容</p>
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-xs">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{completedCount} of {exercises.length} 练习</span>
                    <span className="text-orange-400 font-medium">{progress}%</span>
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
        <h2 className="text-lg font-semibold mb-6">听力练习</h2>
        <div className="space-y-3">
          {exercises.map((exercise, index) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                if (!exercise.locked && exercise.hasContent) {
                  navigate(`/modules/listening/exercise/${exercise.id}`);
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
                  : 'bg-orange-500/20 text-orange-400'
              }`}>
                {exercise.completed ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : exercise.locked ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Headphones className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">{exercise.title}</h3>
                <p className="text-sm text-gray-500">{exercise.description} • {exercise.duration}</p>
              </div>
              {!exercise.locked && exercise.hasContent && (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/modules/listening/exercise/${exercise.id}`);
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
        <div className="mt-8 bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Headphones className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-orange-300 font-medium">听力训练提示</p>
              <p className="text-sm text-gray-400 mt-1">
                点击播放按钮听音频，可以重复播放。然后选择或输入你听到的内容。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
