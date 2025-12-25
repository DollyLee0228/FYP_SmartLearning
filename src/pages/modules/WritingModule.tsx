import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PenTool, Play, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const prompts = [
  { id: 'writing-1', title: 'Describe Your Hometown', type: 'Descriptive Essay', level: 'Beginner', wordLimit: '150-300' },
  { id: 'writing-2', title: 'A Letter to Your Future Self', type: 'Personal Letter', level: 'Beginner', wordLimit: '200-350' },
  { id: 3, title: 'My Favorite Holiday', type: 'Narrative Essay', level: 'Beginner', locked: true, wordLimit: '200-400' },
  { id: 4, title: 'The Importance of Education', type: 'Argumentative Essay', level: 'Intermediate', locked: true, wordLimit: '300-500' },
  { id: 5, title: 'A Person Who Inspires Me', type: 'Descriptive Essay', level: 'Intermediate', locked: true, wordLimit: '250-400' },
  { id: 6, title: 'Technology: Friend or Foe?', type: 'Argumentative Essay', level: 'Advanced', locked: true, wordLimit: '400-600' },
];

export default function WritingModule() {
  const navigate = useNavigate();

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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
              <PenTool className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold mb-2">Writing Practice</h1>
              <p className="text-gray-400 mb-4">Write essays based on prompts and get feedback from admins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Writing Prompts List */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-lg font-semibold mb-6">Writing Prompts</h2>
        <div className="space-y-3">
          {prompts.map((prompt, index) => (
            <motion.div
              key={String(prompt.id)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                if (!prompt.locked && typeof prompt.id === 'string') {
                  navigate(`/modules/writing/exercise/${prompt.id}`);
                }
              }}
              className={`bg-[#111827] rounded-xl border border-white/10 p-4 flex items-center gap-4 ${
                prompt.locked ? 'opacity-50' : 'hover:border-white/20 cursor-pointer'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                prompt.locked
                  ? 'bg-white/5 text-gray-500'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {prompt.locked ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">{prompt.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{prompt.type}</span>
                  <span>•</span>
                  <span>{prompt.level}</span>
                  <span>•</span>
                  <span>{prompt.wordLimit} words</span>
                </div>
              </div>
              {!prompt.locked && typeof prompt.id === 'string' && (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/modules/writing/exercise/${prompt.id}`);
                  }}
                >
                  <Play className="w-4 h-4 mr-1" />
                  Start
                </Button>
              )}
              {prompt.locked && (
                <span className="text-xs text-gray-500">Coming soon</span>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-8 bg-white/5 rounded-xl border border-white/10 p-6">
          <h3 className="font-semibold mb-2 text-emerald-400">How it works</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">1.</span>
              <span>Choose a writing prompt and read the instructions carefully</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">2.</span>
              <span>Write your essay following the word limit guidelines</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">3.</span>
              <span>Submit your essay for review</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400">4.</span>
              <span>An admin will grade your work and provide detailed feedback</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
