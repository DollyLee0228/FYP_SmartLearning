export type EnglishLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface LevelInfo {
  level: EnglishLevel;
  name: string;
  description: string;
  color: string;
}

export const LEVELS: Record<EnglishLevel, LevelInfo> = {
  A1: { level: 'A1', name: 'Beginner', description: 'Basic phrases and expressions', color: 'beginner' },
  A2: { level: 'A2', name: 'Elementary', description: 'Simple everyday conversations', color: 'beginner' },
  B1: { level: 'B1', name: 'Intermediate', description: 'Handle most travel situations', color: 'intermediate' },
  B2: { level: 'B2', name: 'Upper Intermediate', description: 'Interact with fluency', color: 'intermediate' },
  C1: { level: 'C1', name: 'Advanced', description: 'Complex texts and ideas', color: 'advanced' },
  C2: { level: 'C2', name: 'Proficient', description: 'Near-native fluency', color: 'advanced' },
};

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: EnglishLevel;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  lessons: number;
  completed: number;
  color: string;
}

export interface LearningStreak {
  current: number;
  longest: number;
  lastActiveDate: string;
}

export interface UserProgress {
  level: EnglishLevel;
  xp: number;
  totalLessons: number;
  completedLessons: number;
  streak: LearningStreak;
  weeklyProgress: number[];
  moduleProgress: Record<string, number>;
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'lesson' | 'practice' | 'review';
  module: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number;
}

export interface LessonSection {
  type: 'theory' | 'examples' | 'vocabulary';
  title: string;
  content?: string;
  items?: { sentence: string; explanation: string }[];
  words?: { word: string; definition: string; example: string }[];
}

export interface LessonExercise {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'matching';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface LessonContent {
  id: string;
  moduleId: string;
  title: string;
  duration: string;
  sections: LessonSection[];
  exercises: LessonExercise[];
}
