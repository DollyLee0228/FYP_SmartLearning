import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, TrendingUp, Sparkles, Brain, Target, BarChart3, BookOpen, Award, Zap, UserPlus, CheckSquare, Rocket, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const navigate = useNavigate();

  const stats = [
    { icon: Users, value: '10K+', label: 'Active Learners' },
    { icon: TrendingUp, value: '95%', label: 'Success Rate' },
    { icon: Sparkles, value: '50+', label: 'Learning Modules' },
  ];

  const previewFeatures = [
    { icon: TrendingUp, title: 'Progress Analytics', description: 'Track your improvement in real-time', color: 'text-cyan-400' },
    { icon: Sparkles, title: 'AI Recommendations', description: 'Personalized content just for you', color: 'text-purple-400' },
    { icon: Users, title: 'Interactive Lessons', description: 'Engage with gamified content', color: 'text-emerald-400' },
  ];

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analytics',
      description: 'Our advanced AI analyzes your learning patterns to predict challenges before they arise and optimize your path to fluency.',
      color: 'bg-cyan-500/20 text-cyan-400',
    },
    {
      icon: Target,
      title: 'Personalized Learning Paths',
      description: 'Every learner is unique. Get customized content that adapts to your strengths, weaknesses, and learning pace.',
      color: 'bg-purple-500/20 text-purple-400',
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Visualize your journey with detailed analytics dashboards showing your improvement across all skill areas.',
      color: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      icon: BookOpen,
      title: 'Interactive Modules',
      description: 'Engage with dynamic lessons featuring real-world scenarios, multimedia content, and instant feedback.',
      color: 'bg-cyan-500/20 text-cyan-400',
    },
    {
      icon: Award,
      title: 'Gamification',
      description: 'Stay motivated with achievements, leaderboards, and rewards that make learning feel like an adventure.',
      color: 'bg-purple-500/20 text-purple-400',
    },
    {
      icon: Zap,
      title: 'Real-Time Feedback',
      description: 'Get instant corrections and suggestions as you practice, accelerating your learning dramatically.',
      color: 'bg-emerald-500/20 text-emerald-400',
    },
  ];

  const steps = [
    {
      icon: UserPlus,
      number: '01',
      title: 'Create Your Profile',
      description: 'Sign up and complete a quick assessment to help our AI understand your current level and learning goals.',
      color: 'text-cyan-400 border-cyan-400',
    },
    {
      icon: CheckSquare,
      number: '02',
      title: 'Get Your Personalized Path',
      description: 'Our AI analyzes your profile and creates a custom learning journey tailored to your unique needs.',
      color: 'text-blue-400 border-blue-400',
    },
    {
      icon: Rocket,
      number: '03',
      title: 'Learn & Practice',
      description: 'Engage with interactive lessons, quizzes, and exercises. Get real-time feedback as you progress.',
      color: 'text-blue-400 border-blue-400',
    },
    {
      icon: Trophy,
      number: '04',
      title: 'Achieve Fluency',
      description: 'Track your progress, earn achievements, and watch your English skills transform over time.',
      color: 'text-cyan-400 border-cyan-400',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-cyan-400">Smart Learning</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</a>
            <a href="#benefits" className="text-gray-400 hover:text-white transition-colors">Benefits</a>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate('/quiz')}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0"
            >
              Start Learning
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">AI-Powered Education Platform</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6"
          >
            Learning English with
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              AI-Driven
            </span>
            <br />
            Personalized Learning
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10"
          >
            Transform your English skills with predictive analytics that adapts to your
            unique learning style. Get real-time feedback, personalized paths, and
            achieve results faster.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center mb-16"
          >
            <Button
              onClick={() => navigate('/quiz')}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-6 text-lg"
            >
              Start Learning Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-12 md:gap-20 mb-16"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <stat.icon className="w-5 h-5 text-cyan-400" />
                  <span className="text-3xl md:text-4xl font-display font-bold text-cyan-400">{stat.value}</span>
                </div>
                <span className="text-sm text-gray-500">{stat.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-[#111827] rounded-2xl border border-white/10 p-6 shadow-2xl">
              <div className="flex gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {previewFeatures.map((feature) => (
                  <div
                    key={feature.title}
                    className="bg-[#0a0f1a] rounded-xl p-6 border border-white/5"
                  >
                    <div className={`w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-4 ${feature.color}`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-cyan-400 font-semibold tracking-wider uppercase text-sm">FEATURES</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mt-4">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Excel
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto mt-6">
              Our platform combines cutting-edge AI technology with proven educational
              methodologies to deliver an unmatched learning experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#111827] rounded-2xl p-8 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-cyan-400 font-semibold tracking-wider uppercase text-sm">HOW IT WORKS</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mt-4">
              Your Journey to{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Fluency
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto mt-6">
              Getting started is simple. Follow these four steps to begin your personalized
              learning experience.
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-16 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-cyan-500/50 via-blue-500/50 to-cyan-500/50" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="text-center relative"
                >
                  <div className="relative inline-block mb-6">
                    <div className={`w-20 h-20 rounded-full bg-[#111827] border-2 ${step.color} flex items-center justify-center mx-auto`}>
                      <step.icon className={`w-8 h-8 ${step.color.split(' ')[0]}`} />
                    </div>
                    <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#0a0f1a] border ${step.color} flex items-center justify-center text-xs font-bold ${step.color.split(' ')[0]}`}>
                      {step.number}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-cyan-400 font-semibold tracking-wider uppercase text-sm">BENEFITS</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mt-4">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Smart Learning
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto mt-6">
              Experience the difference with our AI-powered platform designed to accelerate your English learning journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Learn at Your Own Pace',
                description: 'No pressure, no deadlines. Study whenever and wherever works best for you.',
                gradient: 'from-cyan-500 to-blue-500',
              },
              {
                title: 'Save Time & Money',
                description: 'Get premium learning experience without expensive tutors or courses.',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                title: 'Track Real Progress',
                description: 'See measurable improvements with detailed analytics and progress reports.',
                gradient: 'from-emerald-500 to-teal-500',
              },
              {
                title: 'Expert-Crafted Content',
                description: 'Lessons designed by language experts and refined by AI for maximum effectiveness.',
                gradient: 'from-orange-500 to-red-500',
              },
              {
                title: 'Interactive Practice',
                description: 'Engage with real-world scenarios and get instant feedback on your performance.',
                gradient: 'from-blue-500 to-indigo-500',
              },
              {
                title: '100% Free Access',
                description: 'All features available at no cost. Start your journey today without any barriers.',
                gradient: 'from-pink-500 to-rose-500',
              },
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#111827] rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-400 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          © 2024 Smart Learning. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
