import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { learningModules } from '@/data/modules';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Library,
  FileText,
  Headphones,
  PenTool,
  Mic,
  Play,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Library,
  FileText,
  Headphones,
  PenTool,
  Mic,
};

const colorMap: Record<string, string> = {
  primary: 'var(--gradient-primary)',
  accent: 'var(--gradient-accent)',
  info: 'linear-gradient(135deg, hsl(var(--info)) 0%, hsl(199 89% 38%) 100%)',
  warning: 'var(--gradient-streak)',
  success: 'linear-gradient(135deg, hsl(var(--success)) 0%, hsl(142 71% 35%) 100%)',
  streak: 'var(--gradient-streak)',
};

export function ModuleGrid() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="mb-6">
        <h2 className="font-display font-semibold text-xl">Learning Modules</h2>
        <p className="text-sm text-muted-foreground">Continue where you left off</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {learningModules.map((module) => {
          const Icon = iconMap[module.icon] || BookOpen;
          const progress = Math.round((module.completed / module.lessons) * 100);
          const gradient = colorMap[module.color] || colorMap.primary;

          return (
            <motion.div key={module.id} variants={itemVariants}>
              <Card
                className="module-card group relative overflow-hidden"
                onClick={() => navigate(`/modules/${module.id}`)}
              >
                {/* Background decoration */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 opacity-10 -translate-y-8 translate-x-8 rounded-full blur-2xl transition-all group-hover:opacity-20"
                  style={{ background: gradient }}
                />

                <div className="relative space-y-4">
                  {/* Icon and Play Button */}
                  <div className="flex items-start justify-between">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: gradient }}
                    >
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <button className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground">
                      <Play className="w-4 h-4 ml-0.5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="font-semibold text-lg">{module.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{module.description}</p>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {module.completed} of {module.lessons} lessons
                      </span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
