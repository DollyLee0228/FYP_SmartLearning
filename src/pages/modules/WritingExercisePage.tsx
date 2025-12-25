import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, PenTool, Send, Clock, CheckCircle2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface WritingPrompt {
  id: string;
  title: string;
  level: string;
  type: string;
  prompt: string;
  tips: string[];
  wordLimit: { min: number; max: number };
}

const writingPrompts: Record<string, WritingPrompt> = {
  'writing-1': {
    id: 'writing-1',
    title: 'Describe Your Hometown',
    level: 'Beginner',
    type: 'Descriptive Essay',
    prompt: `Write a descriptive essay about your hometown. Include the following:
    
• Where is your hometown located?
• What does it look like? (buildings, nature, streets)
• What is the weather like?
• What do people do there for work or fun?
• What is your favorite place in your hometown and why?
• What makes your hometown special to you?`,
    tips: [
      'Use descriptive adjectives to paint a picture',
      'Include sensory details (what you see, hear, smell)',
      'Organize your essay with an introduction, body, and conclusion',
      'Use transition words like "also", "moreover", "however"'
    ],
    wordLimit: { min: 150, max: 300 }
  },
  'writing-2': {
    id: 'writing-2',
    title: 'A Letter to Your Future Self',
    level: 'Beginner',
    type: 'Personal Letter',
    prompt: `Write a letter to yourself 10 years in the future. Include:

• A greeting to your future self
• What you are doing now (studies, hobbies, daily life)
• Your current dreams and goals
• Questions you want to ask your future self
• Your hopes for what life will be like in 10 years
• A closing message`,
    tips: [
      'Use the correct letter format with greeting and closing',
      'Write in a friendly, personal tone',
      'Be specific about your current life and goals',
      'Express your feelings honestly'
    ],
    wordLimit: { min: 200, max: 350 }
  }
};

// Mock submitted essays (in real app, this would come from database)
interface SubmittedEssay {
  id: string;
  promptId: string;
  content: string;
  submittedAt: string;
  status: 'pending' | 'reviewed';
  feedback?: string;
  score?: number;
}

export default function WritingExercisePage() {
  const navigate = useNavigate();
  const { exerciseId } = useParams();
  const prompt = writingPrompts[exerciseId || ''];
  
  const [essay, setEssay] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Check if there's a previously submitted essay (mock)
  const [previousSubmission] = useState<SubmittedEssay | null>(null);

  if (!prompt) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Writing prompt not found</h1>
          <Button onClick={() => navigate('/modules/writing')}>Back to Writing</Button>
        </div>
      </div>
    );
  }

  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;
  const isWithinLimit = wordCount >= prompt.wordLimit.min && wordCount <= prompt.wordLimit.max;
  const canSubmit = wordCount >= prompt.wordLimit.min;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSubmitted(true);
    setIsSubmitting(false);
    toast.success('Essay submitted successfully! An admin will review it soon.');
  };

  if (submitted || previousSubmission) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] text-white">
        {/* Header */}
        <div className="bg-[#111827] border-b border-white/10">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <button
              onClick={() => navigate('/modules/writing')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Writing
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <PenTool className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold">{prompt.title}</h1>
                <p className="text-sm text-gray-400">{prompt.type}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111827] rounded-xl border border-white/10 p-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Essay Submitted!</h2>
            <p className="text-gray-400 mb-6">
              Your essay has been submitted for review. An admin will grade your work and provide feedback.
            </p>
            
            <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Clock className="w-4 h-4" />
                <span>Status: Pending Review</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <FileText className="w-4 h-4" />
                <span>Word count: {wordCount} words</span>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/modules/writing')}
                className="border-white/10 text-gray-300 hover:bg-white/5"
              >
                Back to Writing
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
              >
                Go to Dashboard
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Header */}
      <div className="bg-[#111827] border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate('/modules/writing')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Writing
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <PenTool className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold">{prompt.title}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span>{prompt.type}</span>
                <span>•</span>
                <span>{prompt.level}</span>
                <span>•</span>
                <span>{prompt.wordLimit.min}-{prompt.wordLimit.max} words</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Writing Prompt */}
          <div className="lg:col-span-1 space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#111827] rounded-xl border border-white/10 p-5"
            >
              <h2 className="text-lg font-semibold mb-3 text-emerald-400">Writing Prompt</h2>
              <div className="text-gray-300 whitespace-pre-line text-sm leading-relaxed">
                {prompt.prompt}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#111827] rounded-xl border border-white/10 p-5"
            >
              <h2 className="text-lg font-semibold mb-3 text-blue-400">Writing Tips</h2>
              <ul className="space-y-2">
                {prompt.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-400">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Essay Writing Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-[#111827] rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Your Essay</h2>
                <div className={`text-sm font-medium ${
                  wordCount === 0
                    ? 'text-gray-500'
                    : isWithinLimit
                    ? 'text-emerald-400'
                    : wordCount < prompt.wordLimit.min
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`}>
                  {wordCount} / {prompt.wordLimit.min}-{prompt.wordLimit.max} words
                </div>
              </div>

              <Textarea
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder="Start writing your essay here..."
                className="min-h-[400px] bg-white/5 border-white/10 text-white placeholder:text-gray-500 resize-none focus:border-emerald-500/50 focus:ring-emerald-500/20"
              />

              {wordCount > 0 && wordCount < prompt.wordLimit.min && (
                <p className="text-sm text-yellow-400 mt-2">
                  Write at least {prompt.wordLimit.min - wordCount} more words to submit
                </p>
              )}

              {wordCount > prompt.wordLimit.max && (
                <p className="text-sm text-red-400 mt-2">
                  You are {wordCount - prompt.wordLimit.max} words over the limit
                </p>
              )}

              <div className="flex justify-end mt-6">
                <Button
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit for Review
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Your essay will be reviewed by an admin who will provide feedback and a grade.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
