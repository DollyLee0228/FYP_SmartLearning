// importVideos.ts
// 放在 src/scripts/ 或 src/utils/ 文件夹里

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

// ✅ 示例视频数据
const videosData = [
  {
    title: "English Greetings and Introductions",
    description: "Learn how to greet people and introduce yourself in English. Perfect for beginners!",
    thumbnail: "https://img.youtube.com/vi/t8pPdKYpowI/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/t8pPdKYpowI",
    duration: "10:25",
    category: "conversation",
    level: "beginner",
    views: 1250,
    likes: 89,
    tags: ["greetings", "introductions", "basics", "conversation"]
  },
  {
    title: "Present Simple Tense Explained",
    description: "Master the present simple tense with clear examples and practice exercises.",
    thumbnail: "https://img.youtube.com/vi/a_E6H-OcTa0/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/a_E6H-OcTa0",
    duration: "15:30",
    category: "grammar",
    level: "beginner",
    views: 2340,
    likes: 156,
    tags: ["grammar", "tenses", "present-simple", "basics"]
  },
  {
    title: "Common Phrasal Verbs in Daily Life",
    description: "Learn the most common phrasal verbs used in everyday English conversations.",
    thumbnail: "https://img.youtube.com/vi/UlihshNhPOg/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/UlihshNhPOg",
    duration: "12:15",
    category: "vocabulary",
    level: "intermediate",
    views: 890,
    likes: 67,
    tags: ["phrasal-verbs", "vocabulary", "daily-english", "idioms"]
  },
  {
    title: "British vs American Pronunciation",
    description: "Understand the key differences between British and American English pronunciation.",
    thumbnail: "https://img.youtube.com/vi/rkcGm-pWwsQ/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/rkcGm-pWwsQ",
    duration: "18:45",
    category: "pronunciation",
    level: "intermediate",
    views: 3200,
    likes: 245,
    tags: ["pronunciation", "accent", "british", "american"]
  },
  {
    title: "Business English: Email Writing",
    description: "Learn how to write professional emails in English for business communication.",
    thumbnail: "https://img.youtube.com/vi/vU-ibdHkz4Y/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/vU-ibdHkz4Y",
    duration: "22:10",
    category: "conversation",
    level: "advanced",
    views: 1560,
    likes: 123,
    tags: ["business-english", "email", "writing", "professional"]
  },
  {
    title: "English Culture: Tea Time Traditions",
    description: "Explore the British tea time culture and learn related vocabulary and customs.",
    thumbnail: "https://img.youtube.com/vi/Nv74WHH1K7w/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/Nv74WHH1K7w",
    duration: "14:30",
    category: "culture",
    level: "intermediate",
    views: 780,
    likes: 54,
    tags: ["culture", "british", "traditions", "tea-time"]
  },
  {
    title: "Past Simple vs Past Continuous",
    description: "Understand when to use past simple and past continuous tenses with real examples.",
    thumbnail: "https://img.youtube.com/vi/D1xGmZ7lC7Q/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/D1xGmZ7lC7Q",
    duration: "16:20",
    category: "grammar",
    level: "intermediate",
    views: 1890,
    likes: 134,
    tags: ["grammar", "tenses", "past-simple", "past-continuous"]
  },
  {
    title: "Top 100 Most Common English Words",
    description: "Learn the 100 most frequently used words in English with pronunciation and examples.",
    thumbnail: "https://img.youtube.com/vi/EzKu9w38Z3w/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/EzKu9w38Z3w",
    duration: "20:45",
    category: "vocabulary",
    level: "beginner",
    views: 4200,
    likes: 312,
    tags: ["vocabulary", "common-words", "basics", "pronunciation"]
  },
  {
    title: "American Slang and Expressions",
    description: "Master modern American slang and everyday expressions used by native speakers.",
    thumbnail: "https://img.youtube.com/vi/b3cSb78ViNE/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/b3cSb78ViNE",
    duration: "11:30",
    category: "conversation",
    level: "advanced",
    views: 2100,
    likes: 178,
    tags: ["slang", "american-english", "expressions", "native-speakers"]
  },
  {
    title: "Difficult English Pronunciation Sounds",
    description: "Practice the most challenging English sounds for non-native speakers.",
    thumbnail: "https://img.youtube.com/vi/dfoRdKuPF9I/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/dfoRdKuPF9I",
    duration: "13:50",
    category: "pronunciation",
    level: "advanced",
    views: 1450,
    likes: 98,
    tags: ["pronunciation", "difficult-sounds", "practice", "speaking"]
  },
  {
    title: "Future Tenses: Will vs Going To",
    description: "Learn the difference between 'will' and 'going to' for future actions.",
    thumbnail: "https://img.youtube.com/vi/6hbb3P5wWSI/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/6hbb3P5wWSI",
    duration: "14:15",
    category: "grammar",
    level: "intermediate",
    views: 1670,
    likes: 121,
    tags: ["grammar", "future-tenses", "will", "going-to"]
  },
  {
    title: "English Idioms You Must Know",
    description: "Learn 50 essential English idioms with meanings and usage examples.",
    thumbnail: "https://img.youtube.com/vi/ycfzMvFb2iI/maxresdefault.jpg",
    videoUrl: "https://www.youtube.com/embed/ycfzMvFb2iI",
    duration: "19:30",
    category: "vocabulary",
    level: "advanced",
    views: 2800,
    likes: 203,
    tags: ["idioms", "expressions", "vocabulary", "advanced"]
  }
];

// ✅ 导入函数
export async function importVideos() {
  try {
    console.log('🎥 Starting video import...');
    
    let successCount = 0;
    let errorCount = 0;

    for (const video of videosData) {
      try {
        await addDoc(collection(db, 'videos'), {
          ...video,
          uploadedAt: Timestamp.now()
        });
        successCount++;
        console.log(`✅ Imported: ${video.title}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to import: ${video.title}`, error);
      }
    }

    console.log('🎉 Import complete!');
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    
    return {
      success: true,
      successCount,
      errorCount,
      total: videosData.length
    };
  } catch (error) {
    console.error('❌ Import failed:', error);
    return {
      success: false,
      error
    };
  }
}