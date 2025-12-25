export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category: 'grammar' | 'vocabulary' | 'pronunciation' | 'conversation' | 'culture';
  videoUrl: string;
  views: number;
  likes: number;
}

export const videos: Video[] = [
  {
    id: 'v1',
    title: 'Present Simple vs Present Continuous',
    description: 'Learn when to use present simple and present continuous tenses with clear examples.',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
    duration: '8:24',
    level: 'A2',
    category: 'grammar',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    views: 15420,
    likes: 892
  },
  {
    id: 'v2',
    title: 'Essential Business Vocabulary',
    description: 'Master 50 essential business English words and phrases for the workplace.',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400',
    duration: '12:35',
    level: 'B1',
    category: 'vocabulary',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    views: 23150,
    likes: 1456
  },
  {
    id: 'v3',
    title: 'American vs British Pronunciation',
    description: 'Understand the key differences between American and British English pronunciation.',
    thumbnail: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400',
    duration: '15:20',
    level: 'B2',
    category: 'pronunciation',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    views: 18900,
    likes: 1203
  },
  {
    id: 'v4',
    title: 'Daily Conversation Practice',
    description: 'Practice everyday conversations with native speakers in various scenarios.',
    thumbnail: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400',
    duration: '10:45',
    level: 'A1',
    category: 'conversation',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    views: 31200,
    likes: 2100
  },
  {
    id: 'v5',
    title: 'Understanding English Idioms',
    description: 'Learn the most common English idioms and how to use them naturally.',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400',
    duration: '14:10',
    level: 'B2',
    category: 'vocabulary',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    views: 12800,
    likes: 945
  },
  {
    id: 'v6',
    title: 'British Culture & Traditions',
    description: 'Explore British culture, traditions, and their influence on the English language.',
    thumbnail: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400',
    duration: '18:30',
    level: 'B1',
    category: 'culture',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    views: 9500,
    likes: 678
  },
  {
    id: 'v7',
    title: 'Advanced Grammar: Conditionals',
    description: 'Master all types of conditional sentences with advanced examples.',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
    duration: '16:45',
    level: 'C1',
    category: 'grammar',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    views: 8200,
    likes: 567
  },
  {
    id: 'v8',
    title: 'English for Travel',
    description: 'Essential English phrases and vocabulary for traveling abroad.',
    thumbnail: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400',
    duration: '11:20',
    level: 'A2',
    category: 'conversation',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    views: 28400,
    likes: 1890
  }
];
