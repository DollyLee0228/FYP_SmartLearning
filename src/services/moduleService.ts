import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';

// ==========================================
// TYPES
// ==========================================
export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  lessons: number;
  completed: number;
  color: string;
  isActive: boolean;
  order: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  duration: string;
  order: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isLocked: boolean;
  hasContent: boolean;
  objectives: string[];
  prerequisites: string[];
  estimatedTime: number;
  xpReward: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  // Progress fields (merged from userProgress)
  completed?: boolean;
  progress?: number;
}

export interface UserProgress {
  id?: string;
  userId: string;
  moduleId: string;
  lessonId: string;
  completed: boolean;
  progress: number;
  currentSection: number;
  totalSections: number;
  score?: number;
  timeSpent: number;
  lastAccessedAt: Timestamp;
  completedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ==========================================
// MODULE OPERATIONS
// ==========================================

/**
 * Get all active modules, ordered by their order field
 */
export async function getAllModules(): Promise<Module[]> {
  try {
    const q = query(
      collection(db, 'modules'),
      where('isActive', '==', true),
      orderBy('order')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Module[];
  } catch (error) {
    console.error('Error fetching modules:', error);
    throw error;
  }
}

/**
 * Get a single module by ID
 */
export async function getModule(moduleId: string): Promise<Module | null> {
  try {
    const docRef = doc(db, 'modules', moduleId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { 
        id: docSnap.id, 
        ...docSnap.data() 
      } as Module;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching module ${moduleId}:`, error);
    throw error;
  }
}

/**
 * Update module data
 */
export async function updateModule(
  moduleId: string, 
  updates: Partial<Module>
): Promise<void> {
  try {
    const moduleRef = doc(db, 'modules', moduleId);
    await updateDoc(moduleRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating module ${moduleId}:`, error);
    throw error;
  }
}

// ==========================================
// LESSON OPERATIONS
// ==========================================

/**
 * Get all lessons for a specific module
 */
export async function getModuleLessons(moduleId: string): Promise<Lesson[]> {
  try {
    const q = query(
      collection(db, 'lessons'),
      where('moduleId', '==', moduleId),
      orderBy('order')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Lesson[];
  } catch (error) {
    console.error(`Error fetching lessons for module ${moduleId}:`, error);
    throw error;
  }
}

/**
 * Get a single lesson by ID
 */
export async function getLesson(lessonId: string): Promise<Lesson | null> {
  try {
    const docRef = doc(db, 'lessons', lessonId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { 
        id: docSnap.id, 
        ...docSnap.data() 
      } as Lesson;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching lesson ${lessonId}:`, error);
    throw error;
  }
}

/**
 * Update lesson data
 */
export async function updateLesson(
  lessonId: string, 
  updates: Partial<Lesson>
): Promise<void> {
  try {
    const lessonRef = doc(db, 'lessons', lessonId);
    await updateDoc(lessonRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating lesson ${lessonId}:`, error);
    throw error;
  }
}

// ==========================================
// USER PROGRESS OPERATIONS
// ==========================================

/**
 * Get user's progress for all lessons in a module
 */
export async function getUserModuleProgress(
  userId: string, 
  moduleId: string
): Promise<UserProgress[]> {
  try {
    const q = query(
      collection(db, 'userProgress'),
      where('userId', '==', userId),
      where('moduleId', '==', moduleId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserProgress[];
  } catch (error) {
    console.error(`Error fetching user progress for module ${moduleId}:`, error);
    throw error;
  }
}

/**
 * Get user's progress for a specific lesson
 */
export async function getUserLessonProgress(
  userId: string, 
  lessonId: string
): Promise<UserProgress | null> {
  try {
    const progressId = `${userId}_${lessonId}`;
    const docRef = doc(db, 'userProgress', progressId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { 
        id: docSnap.id, 
        ...docSnap.data() 
      } as UserProgress;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching lesson progress:`, error);
    throw error;
  }
}

/**
 * Update or create user progress for a lesson
 */
export async function updateUserProgress(
  userId: string,
  moduleId: string,
  lessonId: string,
  progressData: {
    completed?: boolean;
    progress?: number;
    currentSection?: number;
    totalSections?: number;
    score?: number;
    timeSpent?: number;
  }
): Promise<void> {
  try {
    const progressId = `${userId}_${moduleId}_${lessonId}`;
    const progressRef = doc(db, 'userProgress', progressId);
    
    // Check if progress exists
    const progressSnap = await getDoc(progressRef);
    
    const updateData: any = {
      userId,
      moduleId,
      lessonId,
      ...progressData,
      lastAccessedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    if (progressData.completed) {
      updateData.completedAt = serverTimestamp();
    }

    if (progressSnap.exists()) {
      // Update existing progress
      await updateDoc(progressRef, updateData);
    } else {
      // Create new progress
      await setDoc(progressRef, {
        ...updateData,
        createdAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating user progress:', error);
    throw error;
  }
}

/**
 * Get all user progress across all modules
 */
export async function getAllUserProgress(userId: string): Promise<UserProgress[]> {
  try {
    const q = query(
      collection(db, 'userProgress'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserProgress[];
  } catch (error) {
    console.error('Error fetching all user progress:', error);
    throw error;
  }
}

// ==========================================
// COMBINED OPERATIONS
// ==========================================

/**
 * Get module with lessons and user progress merged
 */
export async function getModuleWithProgress(
  moduleId: string,
  userId?: string
): Promise<{
  module: Module | null;
  lessons: Lesson[];
}> {
  try {
    // Fetch module and lessons in parallel
    const [module, lessons] = await Promise.all([
      getModule(moduleId),
      getModuleLessons(moduleId)
    ]);

    if (!module) {
      return { module: null, lessons: [] };
    }

    // If user is logged in, fetch and merge progress
    if (userId) {
      const progressData = await getUserModuleProgress(userId, moduleId);
      
      // Create a map for quick lookup
      const progressMap = new Map(
        progressData.map(p => [p.lessonId, p])
      );

      // Merge progress with lessons
      const lessonsWithProgress = lessons.map(lesson => {
        const progress = progressMap.get(lesson.id);
        return {
          ...lesson,
          completed: progress?.completed || false,
          progress: progress?.progress || 0
        };
      });

      return {
        module,
        lessons: lessonsWithProgress
      };
    }

    return { module, lessons };
  } catch (error) {
    console.error('Error fetching module with progress:', error);
    throw error;
  }
}

/**
 * Calculate module completion statistics
 */
export async function getModuleStats(
  moduleId: string,
  userId: string
): Promise<{
  totalLessons: number;
  completedLessons: number;
  progress: number;
  timeSpent: number;
  averageScore: number;
}> {
  try {
    const [lessons, progressData] = await Promise.all([
      getModuleLessons(moduleId),
      getUserModuleProgress(userId, moduleId)
    ]);

    const completedLessons = progressData.filter(p => p.completed).length;
    const totalTimeSpent = progressData.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
    const scoresArray = progressData.filter(p => p.score !== undefined).map(p => p.score!);
    const averageScore = scoresArray.length > 0
      ? scoresArray.reduce((sum, score) => sum + score, 0) / scoresArray.length
      : 0;

    return {
      totalLessons: lessons.length,
      completedLessons,
      progress: lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0,
      timeSpent: totalTimeSpent,
      averageScore: Math.round(averageScore * 100) / 100
    };
  } catch (error) {
    console.error('Error calculating module stats:', error);
    throw error;
  }
}

// Export all functions
export default {
  // Modules
  getAllModules,
  getModule,
  updateModule,
  
  // Lessons
  getModuleLessons,
  getLesson,
  updateLesson,
  
  // Progress
  getUserModuleProgress,
  getUserLessonProgress,
  updateUserProgress,
  getAllUserProgress,
  
  // Combined
  getModuleWithProgress,
  getModuleStats
};