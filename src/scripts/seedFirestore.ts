import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

// ==========================================
// MODULES DATA
// ==========================================
const modulesData = [
  {
    id: 'grammar',
    title: 'Grammar Fundamentals',
    description: 'Master English grammar rules and structures',
    icon: 'BookOpen',
    lessons: 24,
    completed: 8,
    color: 'primary',
    isActive: true,
    order: 1
  },
  {
    id: 'vocabulary',
    title: 'Vocabulary Builder',
    description: 'Expand your word power with contextual learning',
    icon: 'Library',
    lessons: 30,
    completed: 12,
    color: 'accent',
    isActive: true,
    order: 2
  },
  {
    id: 'reading',
    title: 'Reading Comprehension',
    description: 'Improve reading skills with diverse texts',
    icon: 'FileText',
    lessons: 20,
    completed: 5,
    color: 'info',
    isActive: true,
    order: 3
  },
  {
    id: 'listening',
    title: 'Listening Skills',
    description: 'Train your ear with native speakers',
    icon: 'Headphones',
    lessons: 18,
    completed: 7,
    color: 'warning',
    isActive: true,
    order: 4
  },
  {
    id: 'writing',
    title: 'Writing Practice',
    description: 'Develop clear and effective writing',
    icon: 'PenTool',
    lessons: 16,
    completed: 3,
    color: 'success',
    isActive: true,
    order: 5
  },
  {
    id: 'speaking',
    title: 'Speaking & Pronunciation',
    description: 'Practice speaking with AI feedback',
    icon: 'Mic',
    lessons: 22,
    completed: 4,
    color: 'streak',
    isActive: true,
    order: 6
  }
];

// ==========================================
// GRAMMAR LESSONS DATA
// ==========================================
const grammarLessons = [
  {
    id: 'grammar-1',
    moduleId: 'grammar',
    title: 'Present Simple Tense',
    description: 'Learn how to use present simple tense in everyday communication',
    duration: '15 min',
    order: 1,
    difficulty: 'beginner',
    isLocked: false,
    hasContent: true,
    objectives: [
      'Understand present simple structure',
      'Form positive, negative, and question forms',
      'Use correct subject-verb agreement'
    ],
    prerequisites: [],
    estimatedTime: 15,
    xpReward: 50
  },
  {
    id: 'grammar-2',
    moduleId: 'grammar',
    title: 'Present Continuous Tense',
    description: 'Master the present continuous tense for actions happening now',
    duration: '18 min',
    order: 2,
    difficulty: 'beginner',
    isLocked: false,
    hasContent: true,
    objectives: [
      'Understand when to use present continuous',
      'Form -ing verbs correctly',
      'Distinguish between present simple and continuous'
    ],
    prerequisites: ['grammar-1'],
    estimatedTime: 18,
    xpReward: 50
  },
  {
    id: 'grammar-3',
    moduleId: 'grammar',
    title: 'Past Simple Tense',
    description: 'Learn to talk about completed actions in the past',
    duration: '20 min',
    order: 3,
    difficulty: 'beginner',
    isLocked: false,
    hasContent: false,
    objectives: [
      'Form regular and irregular past tense verbs',
      'Use past simple in affirmative, negative, and questions',
      'Recognize time expressions for past simple'
    ],
    prerequisites: ['grammar-1'],
    estimatedTime: 20,
    xpReward: 60
  },
  {
    id: 'grammar-4',
    moduleId: 'grammar',
    title: 'Past Continuous Tense',
    description: 'Describe actions that were in progress in the past',
    duration: '15 min',
    order: 4,
    difficulty: 'beginner',
    isLocked: false,
    hasContent: false,
    objectives: [
      'Form past continuous tense',
      'Understand interrupted actions',
      'Use time clauses with while and when'
    ],
    prerequisites: ['grammar-3'],
    estimatedTime: 15,
    xpReward: 60
  },
  {
    id: 'grammar-5',
    moduleId: 'grammar',
    title: 'Present Perfect Tense',
    description: 'Connect past actions to the present moment',
    duration: '22 min',
    order: 5,
    difficulty: 'intermediate',
    isLocked: false,
    hasContent: false,
    objectives: [
      'Form present perfect with have/has + past participle',
      'Use for and since with present perfect',
      'Distinguish between present perfect and past simple'
    ],
    prerequisites: ['grammar-3'],
    estimatedTime: 22,
    xpReward: 75
  },
  {
    id: 'grammar-6',
    moduleId: 'grammar',
    title: 'Past Perfect Tense',
    description: 'Talk about actions that happened before other past actions',
    duration: '18 min',
    order: 6,
    difficulty: 'intermediate',
    isLocked: false,
    hasContent: false,
    objectives: [
      'Form past perfect tense',
      'Understand sequence of past events',
      'Use past perfect with time clauses'
    ],
    prerequisites: ['grammar-5'],
    estimatedTime: 18,
    xpReward: 75
  },
  {
    id: 'grammar-7',
    moduleId: 'grammar',
    title: 'Future Simple Tense',
    description: 'Express future intentions and predictions',
    duration: '15 min',
    order: 7,
    difficulty: 'beginner',
    isLocked: false,
    hasContent: false,
    objectives: [
      'Use will and going to for future',
      'Make predictions and promises',
      'Understand the difference between will and going to'
    ],
    prerequisites: ['grammar-1'],
    estimatedTime: 15,
    xpReward: 50
  },
  {
    id: 'grammar-8',
    moduleId: 'grammar',
    title: 'Future Continuous Tense',
    description: 'Talk about actions that will be in progress in the future',
    duration: '20 min',
    order: 8,
    difficulty: 'intermediate',
    isLocked: false,
    hasContent: false,
    objectives: [
      'Form future continuous tense',
      'Use for actions in progress at a future time',
      'Understand polite inquiries about plans'
    ],
    prerequisites: ['grammar-7'],
    estimatedTime: 20,
    xpReward: 75
  },
  {
    id: 'grammar-9',
    moduleId: 'grammar',
    title: 'Conditional Sentences (Type 1)',
    description: 'Express real possibilities in the future',
    duration: '25 min',
    order: 9,
    difficulty: 'intermediate',
    isLocked: false,
    hasContent: true,
    objectives: [
      'Form first conditional sentences',
      'Use if-clauses for real possibilities',
      'Understand result clauses with will'
    ],
    prerequisites: ['grammar-7'],
    estimatedTime: 25,
    xpReward: 80
  },
  {
    id: 'grammar-10',
    moduleId: 'grammar',
    title: 'Conditional Sentences (Type 2)',
    description: 'Talk about hypothetical or unlikely situations',
    duration: '25 min',
    order: 10,
    difficulty: 'intermediate',
    isLocked: true,
    hasContent: false,
    objectives: [
      'Form second conditional sentences',
      'Use past simple in if-clauses',
      'Express hypothetical situations with would'
    ],
    prerequisites: ['grammar-9'],
    estimatedTime: 25,
    xpReward: 80
  },
  {
    id: 'grammar-11',
    moduleId: 'grammar',
    title: 'Conditional Sentences (Type 3)',
    description: 'Express imaginary past situations and their results',
    duration: '25 min',
    order: 11,
    difficulty: 'advanced',
    isLocked: true,
    hasContent: false,
    objectives: [
      'Form third conditional sentences',
      'Use past perfect in if-clauses',
      'Express regrets and criticisms'
    ],
    prerequisites: ['grammar-10'],
    estimatedTime: 25,
    xpReward: 100
  },
  {
    id: 'grammar-12',
    moduleId: 'grammar',
    title: 'Modal Verbs',
    description: 'Express ability, permission, obligation, and possibility',
    duration: '30 min',
    order: 12,
    difficulty: 'intermediate',
    isLocked: true,
    hasContent: false,
    objectives: [
      'Use can, could, may, might, must, should',
      'Understand different meanings of modal verbs',
      'Form negatives and questions with modals'
    ],
    prerequisites: ['grammar-5'],
    estimatedTime: 30,
    xpReward: 90
  }
];

// ==========================================
// VOCABULARY LESSONS DATA (Sample)
// ==========================================
const vocabularyLessons = [
  {
    id: 'vocabulary-1',
    moduleId: 'vocabulary',
    title: 'Basic Greetings',
    description: 'Learn essential greeting expressions',
    duration: '10 min',
    order: 1,
    difficulty: 'beginner',
    isLocked: false,
    hasContent: false,
    objectives: [
      'Learn formal and informal greetings',
      'Understand context for different greetings',
      'Practice common responses'
    ],
    prerequisites: [],
    estimatedTime: 10,
    xpReward: 40
  },
  {
    id: 'vocabulary-2',
    moduleId: 'vocabulary',
    title: 'Family Members',
    description: 'Vocabulary for talking about family',
    duration: '12 min',
    order: 2,
    difficulty: 'beginner',
    isLocked: false,
    hasContent: false,
    objectives: [
      'Learn immediate family vocabulary',
      'Extended family terms',
      'Describe family relationships'
    ],
    prerequisites: [],
    estimatedTime: 12,
    xpReward: 40
  }
  // Add more vocabulary lessons as needed
];

// ==========================================
// SEED FUNCTION
// ==========================================
export async function seedFirestore() {
  try {
    console.log('🌱 Starting Firestore seeding...');
    let successCount = 0;
    let errorCount = 0;

    // ===== SEED MODULES =====
    console.log('\n📚 Seeding modules...');
    for (const module of modulesData) {
      try {
        const moduleRef = doc(db, 'modules', module.id);
        await setDoc(moduleRef, {
          ...module,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log(`✅ Added module: ${module.title}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error adding module ${module.id}:`, error);
        errorCount++;
      }
    }

    // ===== SEED GRAMMAR LESSONS =====
    console.log('\n📖 Seeding grammar lessons...');
    for (const lesson of grammarLessons) {
      try {
        const lessonRef = doc(db, 'lessons', lesson.id);
        await setDoc(lessonRef, {
          ...lesson,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log(`✅ Added lesson: ${lesson.title}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error adding lesson ${lesson.id}:`, error);
        errorCount++;
      }
    }

    // ===== SEED VOCABULARY LESSONS =====
    console.log('\n📝 Seeding vocabulary lessons...');
    for (const lesson of vocabularyLessons) {
      try {
        const lessonRef = doc(db, 'lessons', lesson.id);
        await setDoc(lessonRef, {
          ...lesson,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log(`✅ Added lesson: ${lesson.title}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error adding lesson ${lesson.id}:`, error);
        errorCount++;
      }
    }

    // ===== SUMMARY =====
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Firestore seeding completed!');
    console.log(`✅ Success: ${successCount} documents`);
    console.log(`❌ Errors: ${errorCount} documents`);
    console.log('='.repeat(50));

    return {
      success: true,
      successCount,
      errorCount
    };
  } catch (error) {
    console.error('💥 Fatal error during seeding:', error);
    throw error;
  }
}

// ==========================================
// UTILITY: Clear all data (USE WITH CAUTION!)
// ==========================================
export async function clearAllModuleData() {
  const confirmed = confirm(
    '⚠️ WARNING: This will delete ALL modules and lessons data. Are you sure?'
  );
  
  if (!confirmed) {
    console.log('❌ Operation cancelled');
    return;
  }

  try {
    console.log('🗑️ Clearing all data...');
    
    // Note: You'll need to implement batch deletion
    // Firebase doesn't allow deleting entire collections from client
    // This is better done through Firebase console or Cloud Functions
    
    console.log('⚠️ Please delete collections manually from Firebase Console');
    console.log('Collections to delete: modules, lessons');
    
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}

// ==========================================
// EXPORT FOR USE IN BROWSER CONSOLE
// ==========================================
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.seedFirestore = seedFirestore;
  // @ts-ignore
  window.clearAllModuleData = clearAllModuleData;
  
  console.log('🔥 Firebase seeding functions loaded!');
  console.log('Run: window.seedFirestore() to seed the database');
}