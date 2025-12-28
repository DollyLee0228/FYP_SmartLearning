import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ImportSpeakingLessons() {
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  // ✅ Speaking Lessons Metadata
  const speakingLessons = {
    "speaking-1": {
      id: "speaking-1",
      moduleId: "speaking",
      order: 1,
      title: "Self Introduction",
      duration: "25 min",
      difficulty: "beginner",
      type: "Speaking Practice",
      hasContent: true,
      description: "Learn to introduce yourself confidently in English",
      xpRewards: 100
    },
    "speaking-2": {
      id: "speaking-2",
      moduleId: "speaking",
      order: 2,
      title: "Describing Daily Routines",
      duration: "30 min",
      difficulty: "beginner",
      type: "Speaking Practice",
      hasContent: true,
      description: "Talk about your daily activities and schedules",
      xpRewards: 100
    },
    "speaking-3": {
      id: "speaking-3",
      moduleId: "speaking",
      order: 3,
      title: "Talking About Hobbies",
      duration: "30 min",
      difficulty: "beginner",
      type: "Speaking Practice",
      hasContent: true,
      description: "Express your interests and favorite activities",
      xpRewards: 100
    },
    "speaking-4": {
      id: "speaking-4",
      moduleId: "speaking",
      order: 4,
      title: "Making Phone Calls",
      duration: "35 min",
      difficulty: "intermediate",
      type: "Speaking Practice",
      hasContent: true,
      description: "Handle phone conversations professionally and casually",
      xpRewards: 125
    },
    "speaking-5": {
      id: "speaking-5",
      moduleId: "speaking",
      order: 5,
      title: "Giving Presentations",
      duration: "40 min",
      difficulty: "intermediate",
      type: "Speaking Practice",
      hasContent: true,
      description: "Deliver clear and engaging presentations",
      xpRewards: 125
    },
    "speaking-6": {
      id: "speaking-6",
      moduleId: "speaking",
      order: 6,
      title: "Job Interviews",
      duration: "40 min",
      difficulty: "intermediate",
      type: "Speaking Practice",
      hasContent: true,
      description: "Answer common interview questions effectively",
      xpRewards: 125
    },
    "speaking-7": {
      id: "speaking-7",
      moduleId: "speaking",
      order: 7,
      title: "Expressing Opinions",
      duration: "35 min",
      difficulty: "intermediate",
      type: "Speaking Practice",
      hasContent: true,
      description: "Share your views clearly and persuasively",
      xpRewards: 125
    },
    "speaking-8": {
      id: "speaking-8",
      moduleId: "speaking",
      order: 8,
      title: "Debating Skills",
      duration: "45 min",
      difficulty: "advanced",
      type: "Speaking Practice",
      hasContent: true,
      description: "Argue points logically and handle counterarguments",
      xpRewards: 150
    },
    "speaking-9": {
      id: "speaking-9",
      moduleId: "speaking",
      order: 9,
      title: "Public Speaking",
      duration: "45 min",
      difficulty: "advanced",
      type: "Speaking Practice",
      hasContent: true,
      description: "Speak confidently to large audiences",
      xpRewards: 150
    },
    "speaking-10": {
      id: "speaking-10",
      moduleId: "speaking",
      order: 10,
      title: "Storytelling Techniques",
      duration: "40 min",
      difficulty: "advanced",
      type: "Speaking Practice",
      hasContent: true,
      description: "Tell engaging stories that captivate listeners",
      xpRewards: 150
    }
  };

  // ✅ Speaking-1 LessonContent with SPEAKING PROMPTS
  const speakingContent1 = {
    lessonId: "speaking-1",
    moduleId: "speaking",
    
    introduction: {
      title: "Self Introduction",
      subtitle: "Introduce Yourself Confidently",
      summary: "Master the art of introducing yourself in various situations with confidence and clarity."
    },

    sections: [
      {
        id: "section-1",
        type: "content",
        content: `# Introduction Basics

A good self-introduction includes:

## Essential Elements
- **Name**: Your full name or preferred name
- **Background**: Where you're from
- **Current Status**: What you're doing now (student, professional, etc.)
- **Interests**: Brief mention of hobbies or passions

## Example Structure

**Formal Setting:**
"Good morning. My name is Sarah Chen. I'm from Malaysia, and I'm currently a third-year computer science student at XYZ University. I'm particularly interested in artificial intelligence and machine learning."

**Informal Setting:**
"Hi, I'm Sarah! I'm from Penang, Malaysia. I'm studying computer science and I love coding. In my free time, I enjoy playing badminton and trying new cafes."`
      },
      {
        id: "section-2",
        type: "content",
        content: `# Different Contexts

## Professional Introduction
- Keep it brief and relevant
- Mention your role or expertise
- Add one interesting fact about your work

**Example:**
"Hello, I'm David Lee, a marketing manager with 5 years of experience in digital advertising. I specialize in social media campaigns and have helped increase brand engagement by 40% for my current company."

## Academic Introduction
- State your field of study
- Mention research interests
- Share academic goals

**Example:**
"Hi, I'm Maya Tan. I'm pursuing a Master's degree in Environmental Science. My research focuses on sustainable waste management solutions for urban areas."

## Social Introduction
- Be friendly and approachable
- Share personal interests
- Find common ground

**Example:**
"Hey! I'm Alex. I recently moved here from Singapore. I'm really into photography and hiking. Anyone know good trails around here?"`
      },
      {
        id: "section-3",
        type: "content",
        content: `# Tips for Confident Speaking

## Body Language
- **Maintain eye contact** - Shows confidence
- **Smile naturally** - Makes you approachable
- **Stand/sit straight** - Projects professionalism
- **Use hand gestures** - Emphasizes points naturally

## Voice Control
- **Speak clearly** - Don't rush
- **Moderate pace** - Not too fast or slow
- **Appropriate volume** - Loud enough to hear
- **Vary tone** - Avoid monotone

## Pronunciation Tips
- **Stress important words** - Make key points stand out
- **Pause between sentences** - Give listeners time to process
- **Practice difficult sounds** - Work on challenging pronunciations
- **Record yourself** - Listen and identify areas to improve`
      }
    ],

    // ✅ Speaking Prompts (不是exercises!)
    speakingPrompts: [
      {
        id: 1,
        type: "recording",
        prompt: "Introduce yourself in a formal setting. Say your name, where you're from, what you do, and one interesting fact about yourself.",
        modelSentence: "Good morning. My name is Sarah Chen. I'm from Malaysia, and I'm currently a third-year computer science student at XYZ University. I'm particularly interested in artificial intelligence.",
        tips: [
          "Speak slowly and clearly",
          "Pause between sentences",
          "Emphasize your name and what you do",
          "Keep it under 30 seconds"
        ],
        targetDuration: 20
      },
      {
        id: 2,
        type: "recording",
        prompt: "Introduce yourself casually, as if meeting new friends. Include your name, where you're from, and your hobbies.",
        modelSentence: "Hi! I'm Alex. I'm from Penang, Malaysia. I love photography and trying new cafes on weekends. What about you?",
        tips: [
          "Use a friendly, relaxed tone",
          "Smile while speaking - it shows in your voice!",
          "Sound enthusiastic about your hobbies",
          "End with a question to engage the listener"
        ],
        targetDuration: 15
      },
      {
        id: 3,
        type: "recording",
        prompt: "Practice saying this phrase clearly: 'I'm particularly interested in artificial intelligence and machine learning.'",
        modelSentence: "I'm particularly interested in artificial intelligence and machine learning.",
        tips: [
          "Break it into chunks: 'particularly interested' / 'artificial intelligence' / 'machine learning'",
          "Stress 'particularly', 'artificial', and 'machine'",
          "Don't rush - clarity over speed"
        ],
        targetDuration: 5
      },
      {
        id: 4,
        type: "recording",
        prompt: "Tell us about your current studies or job. Say what you do and why you chose it.",
        modelSentence: "I'm studying computer science because I've always been fascinated by how technology can solve real-world problems. I especially enjoy coding and building applications.",
        tips: [
          "Start with what you do",
          "Explain your reason (use 'because')",
          "Add specific details about what you enjoy",
          "Keep it genuine and personal"
        ],
        targetDuration: 20
      },
      {
        id: 5,
        type: "recording",
        prompt: "Complete self-introduction challenge! Introduce yourself including: name, background, what you do, and your interests. (30-45 seconds)",
        modelSentence: "Hello everyone. My name is David Lee. I'm from Kuala Lumpur, Malaysia. I'm currently working as a software engineer at a tech startup. I've always been passionate about technology and problem-solving. In my free time, I enjoy hiking and reading science fiction novels. I'm excited to be here and look forward to meeting all of you.",
        tips: [
          "Structure: Name → Background → Current role → Interests → Closing",
          "Speak at a natural pace - not too fast",
          "Vary your tone to keep it interesting",
          "End with a friendly closing statement"
        ],
        targetDuration: 40
      }
    ]
  };

  // ✅ Speaking-2 LessonContent
  const speakingContent2 = {
    lessonId: "speaking-2",
    moduleId: "speaking",
    
    introduction: {
      title: "Describing Daily Routines",
      subtitle: "Talk About Your Daily Activities",
      summary: "Learn to describe your daily schedule and activities clearly and naturally in English."
    },

    sections: [
      {
        id: "section-1",
        type: "content",
        content: `# Talking About Daily Routines

## Key Time Expressions

**Morning:**
- in the morning
- at 6:00 AM
- before breakfast
- after I wake up

**Afternoon:**
- in the afternoon
- at noon / at midday
- after lunch

**Evening/Night:**
- in the evening
- at night
- before bed

## Useful Verbs
- wake up
- get up
- brush my teeth
- take a shower
- have breakfast
- go to work/school
- come home
- go to bed`
      },
      {
        id: "section-2",
        type: "content",
        content: `# Frequency Adverbs

Use these to show how often you do something:

- **always** (100%) - "I always wake up at 6 AM"
- **usually** (80%) - "I usually have coffee for breakfast"
- **often** (70%) - "I often walk to work"
- **sometimes** (50%) - "I sometimes work late"
- **rarely** (20%) - "I rarely eat fast food"
- **never** (0%) - "I never skip breakfast"

## Linking Words

- **First** - "First, I check my emails"
- **Then** - "Then I have breakfast"
- **After that** - "After that, I get ready for work"
- **Finally** - "Finally, I review my schedule"`
      },
      {
        id: "section-3",
        type: "content",
        content: `# Pronunciation Focus

## Linking Sounds

In natural speech, we connect words:

- "wake up" → "wake-kup"
- "get up" → "ge-tup"
- "after I" → "after-rai"

## Word Stress

Stress the important content words:

- "I **wake** up at **six**"
- "I **usually** have **coffee**"
- "**After** that, I **go** to **work**"

## Common Contractions

- I am → I'm
- I have → I've
- I will → I'll`
      }
    ],

    speakingPrompts: [
      {
        id: 1,
        type: "recording",
        prompt: "Describe your morning routine. What do you do first, second, and third?",
        modelSentence: "Every morning, I wake up at 6:30. First, I brush my teeth and take a shower. Then, I have breakfast with my family. After that, I get dressed and leave for work at 8 AM.",
        tips: [
          "Use 'First', 'Then', 'After that' to organize",
          "Link your words naturally (wake-kup, ge-tup)",
          "Stress the action verbs: wake, brush, have, leave",
          "Speak at a natural, conversational pace"
        ],
        targetDuration: 20
      },
      {
        id: 2,
        type: "recording",
        prompt: "Practice this sentence with correct linking: 'After I wake up, I usually have a quick breakfast before heading to work.'",
        modelSentence: "After I wake up, I usually have a quick breakfast before heading to work.",
        tips: [
          "Link: 'After-I' → 'After-rai'",
          "Link: 'wake up' → 'wake-kup'",
          "Pause slightly after 'wake up' and 'breakfast'",
          "Stress: usually, quick, heading, work"
        ],
        targetDuration: 6
      },
      {
        id: 3,
        type: "recording",
        prompt: "Describe what you do in the evening after work or school.",
        modelSentence: "In the evening, I usually get home around 6 PM. I have dinner with my family, and then I relax by watching TV or reading. I go to bed around 11 PM.",
        tips: [
          "Use frequency adverbs: usually, always, sometimes",
          "Vary your sentence length for natural flow",
          "Don't rush - pause between sentences",
          "End with your bedtime"
        ],
        targetDuration: 18
      },
      {
        id: 4,
        type: "recording",
        prompt: "Tell us about something you ALWAYS do, something you USUALLY do, and something you NEVER do.",
        modelSentence: "I always wake up early because I'm a morning person. I usually have coffee for breakfast. I never skip my morning exercise routine.",
        tips: [
          "Emphasize the frequency words: ALWAYS, USUALLY, NEVER",
          "Give a brief reason if possible (because...)",
          "Keep each sentence clear and simple",
          "Maintain consistent volume and pace"
        ],
        targetDuration: 15
      },
      {
        id: 5,
        type: "recording",
        prompt: "Complete routine description! Describe your entire day from morning to night. (40-60 seconds)",
        modelSentence: "I usually wake up at 6:30 in the morning. First, I take a shower and get dressed. Then I have a quick breakfast, usually just coffee and toast. I leave home at 8 AM and arrive at the office by 9. During lunch, around 1 PM, I eat with my colleagues. In the afternoon, I work on my projects. I finish at 6 PM and head home. After dinner, I spend time with my family or watch TV. Finally, I go to bed around 11 PM.",
        tips: [
          "Use time markers: in the morning, during lunch, in the afternoon",
          "Connect sentences with linking words: First, Then, After that, Finally",
          "Vary your pace - don't rush",
          "Include specific times (6:30, 8 AM, 11 PM)",
          "Make it sound natural and conversational"
        ],
        targetDuration: 50
      }
    ]
  };

  const importSpeaking = async () => {
    setImporting(true);
    setResults([]);
    const logs: string[] = [];

    try {
      logs.push('🚀 Starting Speaking module import...');
      logs.push('');
      setResults([...logs]);

      // 1. Import lessons metadata
      logs.push('📚 Importing lessons metadata...');
      setResults([...logs]);

      for (const [lessonId, lessonData] of Object.entries(speakingLessons)) {
        try {
          await setDoc(doc(db, 'lessons', lessonId), lessonData);
          logs.push(`✅ Lesson metadata imported: ${lessonId} - ${lessonData.title}`);
          setResults([...logs]);
        } catch (error: any) {
          logs.push(`❌ Error importing ${lessonId}: ${error.message}`);
          setResults([...logs]);
        }
      }

      logs.push('');
      logs.push('🎤 Importing lesson content with speaking prompts...');
      setResults([...logs]);

      // 2. Import speaking-1 content
      try {
        await setDoc(doc(db, 'lessonContent', 'speaking-1'), speakingContent1);
        logs.push('✅ Content imported: speaking-1 - Self Introduction (5 speaking prompts)');
        setResults([...logs]);
      } catch (error: any) {
        logs.push(`❌ Error importing speaking-1 content: ${error.message}`);
        setResults([...logs]);
      }

      // 3. Import speaking-2 content
      try {
        await setDoc(doc(db, 'lessonContent', 'speaking-2'), speakingContent2);
        logs.push('✅ Content imported: speaking-2 - Describing Daily Routines (5 speaking prompts)');
        setResults([...logs]);
      } catch (error: any) {
        logs.push(`❌ Error importing speaking-2 content: ${error.message}`);
        setResults([...logs]);
      }

      logs.push('');
      logs.push('🎉 Speaking module import completed!');
      logs.push('');
      logs.push('📊 Summary:');
      logs.push('   - 10 lesson metadata imported');
      logs.push('   - 2 lesson contents imported (speaking-1, speaking-2)');
      logs.push('   - Each lesson has 5 speaking prompts with recording');
      logs.push('   - 8 lessons ready for content (speaking-3 to speaking-10)');
      logs.push('');
      logs.push('🎤 Features:');
      logs.push('   - Record your voice for each prompt');
      logs.push('   - Listen to model sentences');
      logs.push('   - Get pronunciation tips');
      logs.push('   - Practice at your own pace');
      logs.push('');
      logs.push('✨ Total XP available: 1,250 XP');
      setResults([...logs]);

      toast.success('Speaking module imported successfully!');

    } catch (error: any) {
      logs.push('');
      logs.push(`❌ Fatal error: ${error.message}`);
      setResults([...logs]);
      toast.error('Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          Import Speaking Module 🎤
        </h1>
        <p className="text-gray-400 mb-8">
          Import speaking lessons with voice recording and pronunciation practice
        </p>

        <div className="bg-[#111827] rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">What will be imported:</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <h3 className="text-blue-400 font-semibold mb-2">🎤 Lessons Metadata (10 lessons)</h3>
              <ul className="ml-4 space-y-1 text-sm text-gray-400">
                <li>• speaking-1: Self Introduction (Beginner, 100 XP)</li>
                <li>• speaking-2: Describing Daily Routines (Beginner, 100 XP)</li>
                <li>• speaking-3: Talking About Hobbies (Beginner, 100 XP)</li>
                <li>• speaking-4: Making Phone Calls (Intermediate, 125 XP)</li>
                <li>• speaking-5: Giving Presentations (Intermediate, 125 XP)</li>
                <li>• speaking-6: Job Interviews (Intermediate, 125 XP)</li>
                <li>• speaking-7: Expressing Opinions (Intermediate, 125 XP)</li>
                <li>• speaking-8: Debating Skills (Advanced, 150 XP)</li>
                <li>• speaking-9: Public Speaking (Advanced, 150 XP)</li>
                <li>• speaking-10: Storytelling Techniques (Advanced, 150 XP)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-cyan-400 font-semibold mb-2">🎙️ Lesson Content (2 complete lessons)</h3>
              <ul className="ml-4 space-y-1 text-sm text-gray-400">
                <li>• speaking-1: 3 sections + 5 speaking prompts with recording</li>
                <li>• speaking-2: 3 sections + 5 speaking prompts with recording</li>
                <li className="text-yellow-400 mt-2">⚠️ speaking-3 to speaking-10: Metadata only</li>
              </ul>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h3 className="text-blue-400 font-semibold mb-2">✨ Speaking Practice Features:</h3>
              <ul className="ml-4 space-y-1 text-sm text-gray-300">
                <li>• 🎤 Record your voice for each prompt</li>
                <li>• 🔊 Listen to model sentences (TTS)</li>
                <li>• 💡 Get pronunciation tips for each prompt</li>
                <li>• ⏱️ Target duration guidance</li>
                <li>• 🔁 Re-record as many times as you want</li>
              </ul>
            </div>
          </div>

          {!importing && results.length === 0 && (
            <Button
              onClick={importSpeaking}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-lg px-8 py-6 w-full"
            >
              🎤 Import Speaking Module with Recording
            </Button>
          )}

          {importing && (
            <div className="flex items-center justify-center gap-3 text-blue-400 py-4">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-lg">Importing... Please wait...</span>
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Import Log:</h3>
              <div className="bg-black/50 rounded p-4 max-h-[400px] overflow-auto font-mono text-sm">
                {results.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#111827] rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Speaking Lesson Structure</h2>
          <div className="space-y-3 text-sm text-gray-400">
            <div>
              <p className="text-white font-medium mb-1">Each lesson contains:</p>
              <ul className="ml-4 space-y-1">
                <li>• Introduction (title, subtitle, summary)</li>
                <li>• 3 Teaching Sections (speaking techniques + pronunciation tips)</li>
                <li>• 5 Speaking Prompts (recording practice)</li>
              </ul>
            </div>
            <div className="border-t border-white/10 pt-3">
              <p className="text-blue-400 font-medium">🎙️ Each Speaking Prompt includes:</p>
              <ul className="ml-4 space-y-1 mt-2">
                <li>• Clear instructions on what to say</li>
                <li>• Model sentence (you can listen to it)</li>
                <li>• 3-4 helpful pronunciation tips</li>
                <li>• Target duration guidance</li>
                <li>• Record button to practice</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}