import { LessonContent } from '@/types/learning';

export const grammarLessons: Record<string, LessonContent> = {
  'grammar-1': {
    id: 'grammar-1',
    moduleId: 'grammar',
    title: 'Present Simple Tense',
    duration: '15 min',
    sections: [
      {
        type: 'theory',
        title: 'What is Present Simple?',
        content: `The Present Simple tense is used to describe habits, unchanging situations, general truths, and fixed arrangements.

**Structure:**
- Positive: Subject + base verb (+ s/es for he/she/it)
- Negative: Subject + do/does not + base verb
- Question: Do/Does + subject + base verb?

**Examples:**
- I **work** in an office.
- She **goes** to school every day.
- They **don't like** coffee.
- **Does** he **play** tennis?`,
      },
      {
        type: 'examples',
        title: 'Common Uses',
        items: [
          { sentence: 'I wake up at 7 AM every day.', explanation: 'Daily habit/routine' },
          { sentence: 'Water boils at 100°C.', explanation: 'Scientific fact' },
          { sentence: 'The train leaves at 9 PM.', explanation: 'Fixed schedule' },
          { sentence: 'She works as a doctor.', explanation: 'Permanent situation' },
        ],
      },
    ],
    exercises: [
      {
        id: 'ex1',
        type: 'multiple-choice',
        question: 'She ___ to work by bus every day.',
        options: ['go', 'goes', 'going', 'went'],
        correctAnswer: 1,
        explanation: 'With "she" (third person singular), we add -es to "go" → "goes"',
      },
      {
        id: 'ex2',
        type: 'multiple-choice',
        question: 'They ___ coffee in the morning.',
        options: ['drinks', 'drink', 'drinking', 'drank'],
        correctAnswer: 1,
        explanation: 'With "they" (plural), we use the base form "drink"',
      },
      {
        id: 'ex3',
        type: 'multiple-choice',
        question: '___ your brother live in London?',
        options: ['Do', 'Does', 'Is', 'Are'],
        correctAnswer: 1,
        explanation: 'For questions with "he/she/it", we use "Does"',
      },
      {
        id: 'ex4',
        type: 'multiple-choice',
        question: 'I ___ not understand this question.',
        options: ['does', 'do', 'am', 'is'],
        correctAnswer: 1,
        explanation: 'With "I", we use "do" for negative sentences',
      },
      {
        id: 'ex5',
        type: 'multiple-choice',
        question: 'The sun ___ in the east.',
        options: ['rise', 'rises', 'rising', 'rose'],
        correctAnswer: 1,
        explanation: 'Scientific facts use Present Simple. "Sun" is singular, so we add -s',
      },
    ],
  },
  'grammar-2': {
    id: 'grammar-2',
    moduleId: 'grammar',
    title: 'Present Continuous Tense',
    duration: '18 min',
    sections: [
      {
        type: 'theory',
        title: 'What is Present Continuous?',
        content: `The Present Continuous tense describes actions happening right now or around the current time.

**Structure:**
- Positive: Subject + am/is/are + verb-ing
- Negative: Subject + am/is/are + not + verb-ing
- Question: Am/Is/Are + subject + verb-ing?

**Examples:**
- I **am working** on a project.
- She **is reading** a book.
- They **are not watching** TV.
- **Are** you **listening** to me?`,
      },
      {
        type: 'examples',
        title: 'When to Use',
        items: [
          { sentence: 'I am typing an email right now.', explanation: 'Action happening at this moment' },
          { sentence: 'She is studying for her exams this week.', explanation: 'Temporary situation' },
          { sentence: 'They are always complaining!', explanation: 'Annoying habit (with "always")' },
          { sentence: 'We are meeting tomorrow at 3 PM.', explanation: 'Future arrangement' },
        ],
      },
    ],
    exercises: [
      {
        id: 'ex1',
        type: 'multiple-choice',
        question: 'Look! The children ___ in the garden.',
        options: ['play', 'plays', 'are playing', 'is playing'],
        correctAnswer: 2,
        explanation: '"Look!" indicates something happening now. "Children" is plural → "are playing"',
      },
      {
        id: 'ex2',
        type: 'multiple-choice',
        question: 'She ___ a new language this semester.',
        options: ['learns', 'is learning', 'learn', 'learning'],
        correctAnswer: 1,
        explanation: '"This semester" indicates a temporary current situation',
      },
      {
        id: 'ex3',
        type: 'multiple-choice',
        question: 'What ___ you ___ right now?',
        options: ['are / doing', 'do / do', 'is / doing', 'are / do'],
        correctAnswer: 0,
        explanation: '"Right now" requires Present Continuous: "are you doing"',
      },
      {
        id: 'ex4',
        type: 'multiple-choice',
        question: 'I ___ to music at the moment.',
        options: ['listen', 'am listening', 'listens', 'listening'],
        correctAnswer: 1,
        explanation: '"At the moment" = now, so we use Present Continuous',
      },
    ],
  },
  'grammar-9': {
    id: 'grammar-9',
    moduleId: 'grammar',
    title: 'Conditional Sentences (Type 1)',
    duration: '25 min',
    sections: [
      {
        type: 'theory',
        title: 'First Conditional',
        content: `The First Conditional is used for real and possible situations in the future.

**Structure:**
- If + Present Simple, ... will + base verb
- Will + base verb ... if + Present Simple

**Key Points:**
- Use for likely future situations
- The "if" clause uses Present Simple
- The main clause uses "will" + base verb

**Examples:**
- **If** it **rains**, I **will stay** home.
- She **will be** happy **if** she **passes** the exam.
- **If** you **don't hurry**, you **will miss** the bus.`,
      },
      {
        type: 'examples',
        title: 'Real-Life Examples',
        items: [
          { sentence: 'If I have time, I will call you.', explanation: 'Possible future action' },
          { sentence: 'You will fail if you do not study.', explanation: 'Warning/consequence' },
          { sentence: 'If the weather is nice, we will go to the beach.', explanation: 'Future plan depending on condition' },
          { sentence: 'I will help you if you ask me.', explanation: 'Offer with condition' },
        ],
      },
    ],
    exercises: [
      {
        id: 'ex1',
        type: 'multiple-choice',
        question: 'If she ___ hard, she will pass the exam.',
        options: ['will study', 'studies', 'studied', 'study'],
        correctAnswer: 1,
        explanation: 'After "if" in First Conditional, use Present Simple (studies)',
      },
      {
        id: 'ex2',
        type: 'multiple-choice',
        question: 'I ___ you if I see him.',
        options: ['tell', 'told', 'will tell', 'telling'],
        correctAnswer: 2,
        explanation: 'The main clause uses "will" + base verb',
      },
      {
        id: 'ex3',
        type: 'multiple-choice',
        question: 'If it ___ tomorrow, we will cancel the picnic.',
        options: ['will rain', 'rains', 'rained', 'rain'],
        correctAnswer: 1,
        explanation: 'After "if", use Present Simple even for future meaning',
      },
      {
        id: 'ex4',
        type: 'multiple-choice',
        question: 'They will be late if they ___ now.',
        options: ['will not leave', 'do not leave', 'did not leave', 'not leave'],
        correctAnswer: 1,
        explanation: 'Negative in "if" clause: "do not" + base verb',
      },
      {
        id: 'ex5',
        type: 'multiple-choice',
        question: 'What will you do if you ___ the lottery?',
        options: ['will win', 'win', 'won', 'winning'],
        correctAnswer: 1,
        explanation: 'Present Simple after "if" for possible future situations',
      },
    ],
  },
};

export const vocabularyLessons: Record<string, LessonContent> = {
  'vocabulary-1': {
    id: 'vocabulary-1',
    moduleId: 'vocabulary',
    title: 'Everyday Essentials',
    duration: '20 min',
    sections: [
      {
        type: 'theory',
        title: 'Common Daily Words',
        content: `Master these essential words for everyday communication.

**Greetings & Basics:**
- Hello, Hi, Hey (informal)
- Goodbye, Bye, See you later
- Please, Thank you, You're welcome
- Sorry, Excuse me

**Time Expressions:**
- Today, Tomorrow, Yesterday
- Morning, Afternoon, Evening, Night
- Now, Later, Soon, Always, Never`,
      },
      {
        type: 'vocabulary',
        title: 'Word List',
        words: [
          { word: 'Essential', definition: 'Absolutely necessary; extremely important', example: 'Water is essential for life.' },
          { word: 'Frequent', definition: 'Happening often; common', example: 'She makes frequent trips to the store.' },
          { word: 'Convenient', definition: 'Easy to use or suitable for your needs', example: 'The location is very convenient.' },
          { word: 'Necessary', definition: 'Required; that you must have or do', example: 'It is necessary to bring your ID.' },
          { word: 'Available', definition: 'Able to be used or obtained', example: 'Is this item available in blue?' },
          { word: 'Comfortable', definition: 'Providing physical ease and relaxation', example: 'This chair is very comfortable.' },
        ],
      },
    ],
    exercises: [
      {
        id: 'ex1',
        type: 'multiple-choice',
        question: 'Something that is "essential" is:',
        options: ['Optional', 'Absolutely necessary', 'Expensive', 'Complicated'],
        correctAnswer: 1,
        explanation: 'Essential means something is absolutely necessary or extremely important.',
      },
      {
        id: 'ex2',
        type: 'multiple-choice',
        question: 'Choose the correct word: "The hotel is ___ located near the airport."',
        options: ['frequently', 'essentially', 'conveniently', 'necessarily'],
        correctAnswer: 2,
        explanation: 'Conveniently means in a way that is easy or suitable.',
      },
      {
        id: 'ex3',
        type: 'multiple-choice',
        question: '"Available" means:',
        options: ['Too expensive', 'Very large', 'Able to be used', 'Difficult to find'],
        correctAnswer: 2,
        explanation: 'Available means something can be used or obtained.',
      },
    ],
  },
};

export const readingLessons: Record<string, LessonContent> = {
  'reading-1': {
    id: 'reading-1',
    moduleId: 'reading',
    title: 'Short Stories for Beginners',
    duration: '15 min',
    sections: [
      {
        type: 'theory',
        title: 'Reading Strategy: Scanning',
        content: `**Scanning** is a reading technique to quickly find specific information.

**How to Scan:**
- Know what you're looking for before reading
- Move your eyes quickly over the text
- Look for key words, numbers, or names
- Don't read every word

**Tips:**
- Use headings and subheadings
- Look for bold or italicized words
- Numbers and dates stand out easily`,
      },
      {
        type: 'examples',
        title: 'Practice Passage',
        items: [
          { sentence: 'The morning sun cast long shadows across the quiet village of Millbrook.', explanation: 'Setting: a village called Millbrook in the morning' },
          { sentence: 'Sarah, a young teacher, walked briskly to the small schoolhouse.', explanation: 'Main character: Sarah, occupation: teacher' },
          { sentence: 'She had been teaching there for three years now.', explanation: 'Time reference: 3 years of experience' },
          { sentence: 'Today was special - it was the annual spelling bee competition.', explanation: 'Event: spelling bee competition' },
        ],
      },
    ],
    exercises: [
      {
        id: 'ex1',
        type: 'multiple-choice',
        question: 'What is the name of the village in the passage?',
        options: ['Milltown', 'Millbrook', 'Brookville', 'Millfield'],
        correctAnswer: 1,
        explanation: 'The passage mentions "the quiet village of Millbrook".',
      },
      {
        id: 'ex2',
        type: 'multiple-choice',
        question: 'What is Sarah\'s profession?',
        options: ['Doctor', 'Farmer', 'Teacher', 'Shop owner'],
        correctAnswer: 2,
        explanation: 'Sarah is described as "a young teacher".',
      },
      {
        id: 'ex3',
        type: 'multiple-choice',
        question: 'How long has Sarah been teaching?',
        options: ['One year', 'Two years', 'Three years', 'Five years'],
        correctAnswer: 2,
        explanation: 'The passage states "She had been teaching there for three years".',
      },
      {
        id: 'ex4',
        type: 'multiple-choice',
        question: 'What special event is happening today?',
        options: ['A graduation ceremony', 'A spelling bee', 'A sports day', 'A music concert'],
        correctAnswer: 1,
        explanation: 'It mentions "the annual spelling bee competition".',
      },
    ],
  },
  'reading-2': {
    id: 'reading-2',
    moduleId: 'reading',
    title: 'News Article Basics',
    duration: '18 min',
    sections: [
      {
        type: 'theory',
        title: 'Understanding News Articles',
        content: `News articles follow a specific structure to deliver information efficiently.

**The Inverted Pyramid:**
- Most important information first
- Supporting details in the middle
- Background information at the end

**Key Questions Answered:**
- **Who** is the story about?
- **What** happened?
- **When** did it happen?
- **Where** did it take place?
- **Why** did it happen?
- **How** did it happen?`,
      },
      {
        type: 'examples',
        title: 'Sample News Article',
        items: [
          { sentence: 'Local Library Opens New Digital Learning Center', explanation: 'Headline - summarizes the main story' },
          { sentence: 'The Westfield Public Library unveiled its new $2 million digital learning center on Monday.', explanation: 'Lead paragraph - answers Who, What, When' },
          { sentence: 'The facility features 50 computers, a maker space, and free coding classes.', explanation: 'Supporting details - describes the center' },
          { sentence: 'Mayor Johnson attended the ribbon-cutting ceremony alongside community leaders.', explanation: 'Additional information - who attended' },
        ],
      },
    ],
    exercises: [
      {
        id: 'ex1',
        type: 'multiple-choice',
        question: 'In news articles, the most important information appears:',
        options: ['At the end', 'In the middle', 'At the beginning', 'Randomly throughout'],
        correctAnswer: 2,
        explanation: 'The inverted pyramid structure puts the most important information first.',
      },
      {
        id: 'ex2',
        type: 'multiple-choice',
        question: 'How much did the digital learning center cost?',
        options: ['$1 million', '$2 million', '$5 million', '$500,000'],
        correctAnswer: 1,
        explanation: 'The article mentions "its new $2 million digital learning center".',
      },
      {
        id: 'ex3',
        type: 'multiple-choice',
        question: 'Who attended the ribbon-cutting ceremony?',
        options: ['The Governor', 'Mayor Johnson', 'The Library Director', 'The President'],
        correctAnswer: 1,
        explanation: 'The passage states "Mayor Johnson attended the ribbon-cutting ceremony".',
      },
    ],
  },
};

export const listeningLessons: Record<string, LessonContent> = {
  'listening-1': {
    id: 'listening-1',
    moduleId: 'listening',
    title: 'Basic Conversations',
    duration: '15 min',
    sections: [
      {
        type: 'theory',
        title: 'Listening for Key Information',
        content: `When listening to conversations, focus on understanding the main points.

**Key Listening Skills:**
- Listen for names and places
- Note numbers and times
- Identify the relationship between speakers
- Understand the main topic

**Common Conversation Types:**
- Greetings and introductions
- Making plans
- Asking for directions
- Shopping and ordering
- Phone conversations`,
      },
      {
        type: 'examples',
        title: 'Sample Dialogue Analysis',
        items: [
          { sentence: 'A: Hi! I\'m looking for the train station.', explanation: 'Asking for directions' },
          { sentence: 'B: Sure! Go straight for two blocks, then turn right.', explanation: 'Giving directions with distance and direction' },
          { sentence: 'A: Is it far from here?', explanation: 'Follow-up question about distance' },
          { sentence: 'B: About a 10-minute walk.', explanation: 'Time estimate provided' },
        ],
      },
    ],
    exercises: [
      {
        id: 'ex1',
        type: 'multiple-choice',
        question: 'What is Speaker A looking for?',
        options: ['A bus stop', 'The train station', 'A restaurant', 'A hotel'],
        correctAnswer: 1,
        explanation: 'Speaker A says "I\'m looking for the train station."',
      },
      {
        id: 'ex2',
        type: 'multiple-choice',
        question: 'Which direction should Speaker A turn?',
        options: ['Left', 'Right', 'Straight', 'Back'],
        correctAnswer: 1,
        explanation: 'Speaker B says "turn right".',
      },
      {
        id: 'ex3',
        type: 'multiple-choice',
        question: 'How long will it take to walk there?',
        options: ['5 minutes', '10 minutes', '15 minutes', '20 minutes'],
        correctAnswer: 1,
        explanation: 'Speaker B says "About a 10-minute walk."',
      },
    ],
  },
  'listening-2': {
    id: 'listening-2',
    moduleId: 'listening',
    title: 'Phone Calls & Messages',
    duration: '18 min',
    sections: [
      {
        type: 'theory',
        title: 'Understanding Phone Conversations',
        content: `Phone conversations have unique characteristics that require special attention.

**Challenges:**
- No visual cues or body language
- May have background noise
- Often faster paced

**Key Phrases:**
- "May I speak to...?"
- "This is [name] calling."
- "Could you hold, please?"
- "I'll call back later."
- "Can I take a message?"

**Tips:**
- Listen for caller identification
- Note the purpose of the call
- Pay attention to any action items`,
      },
      {
        type: 'examples',
        title: 'Sample Phone Call',
        items: [
          { sentence: 'Receptionist: Good morning, ABC Company. How may I help you?', explanation: 'Professional greeting with company name' },
          { sentence: 'Caller: Hi, this is John Smith. May I speak to Ms. Williams?', explanation: 'Caller identifies themselves and states purpose' },
          { sentence: 'Receptionist: I\'m sorry, she\'s in a meeting. Can I take a message?', explanation: 'Person unavailable - offering alternative' },
          { sentence: 'Caller: Yes, please ask her to call me back at 555-0123.', explanation: 'Leaving callback information' },
        ],
      },
    ],
    exercises: [
      {
        id: 'ex1',
        type: 'multiple-choice',
        question: 'What company did the receptionist answer for?',
        options: ['XYZ Company', 'ABC Company', 'Williams Corp', 'Smith Industries'],
        correctAnswer: 1,
        explanation: 'The receptionist says "Good morning, ABC Company."',
      },
      {
        id: 'ex2',
        type: 'multiple-choice',
        question: 'Why is Ms. Williams unavailable?',
        options: ['She\'s on vacation', 'She\'s in a meeting', 'She\'s at lunch', 'She left early'],
        correctAnswer: 1,
        explanation: 'The receptionist says "she\'s in a meeting."',
      },
      {
        id: 'ex3',
        type: 'multiple-choice',
        question: 'What is the caller\'s phone number?',
        options: ['555-0321', '555-0132', '555-0123', '555-0213'],
        correctAnswer: 2,
        explanation: 'The caller says "call me back at 555-0123."',
      },
    ],
  },
};

export const writingLessons: Record<string, LessonContent> = {
  'writing-1': {
    id: 'writing-1',
    moduleId: 'writing',
    title: 'Sentence Structure Basics',
    duration: '15 min',
    sections: [
      {
        type: 'theory',
        title: 'Building Strong Sentences',
        content: `Every sentence needs a subject and a verb to be complete.

**Basic Sentence Pattern:**
Subject + Verb + (Object/Complement)

**Types of Sentences:**
- **Simple:** One independent clause (I like coffee.)
- **Compound:** Two independent clauses joined by a conjunction (I like coffee, but my sister prefers tea.)
- **Complex:** One independent + one dependent clause (Although it was raining, we went outside.)

**Common Mistakes:**
- Run-on sentences (no punctuation between clauses)
- Sentence fragments (missing subject or verb)
- Comma splices (using comma instead of period/conjunction)`,
      },
      {
        type: 'examples',
        title: 'Sentence Examples',
        items: [
          { sentence: 'The cat sleeps.', explanation: 'Simple sentence: subject (cat) + verb (sleeps)' },
          { sentence: 'I finished my work, so I went home.', explanation: 'Compound sentence with conjunction "so"' },
          { sentence: 'Because she studied hard, she passed the exam.', explanation: 'Complex sentence with dependent clause first' },
          { sentence: 'The students who arrived early got the best seats.', explanation: 'Complex sentence with relative clause' },
        ],
      },
    ],
    exercises: [
      {
        id: 'ex1',
        type: 'multiple-choice',
        question: 'Which is a complete sentence?',
        options: ['Running in the park.', 'The dog barks loudly.', 'Because it was raining.', 'Very tired today.'],
        correctAnswer: 1,
        explanation: '"The dog barks loudly" has a subject (dog) and verb (barks).',
      },
      {
        id: 'ex2',
        type: 'multiple-choice',
        question: 'What type is: "I wanted to go, but it was too late."?',
        options: ['Simple sentence', 'Compound sentence', 'Complex sentence', 'Fragment'],
        correctAnswer: 1,
        explanation: 'Two independent clauses joined by "but" = compound sentence.',
      },
      {
        id: 'ex3',
        type: 'multiple-choice',
        question: 'Which conjunction best connects: "I was hungry ___ I ate lunch."?',
        options: ['but', 'so', 'yet', 'or'],
        correctAnswer: 1,
        explanation: '"So" shows cause and effect: hungry = reason for eating.',
      },
    ],
  },
  'writing-2': {
    id: 'writing-2',
    moduleId: 'writing',
    title: 'Paragraph Writing',
    duration: '20 min',
    sections: [
      {
        type: 'theory',
        title: 'Paragraph Structure',
        content: `A well-organized paragraph has three main parts:

**1. Topic Sentence:**
- States the main idea
- Usually the first sentence
- Tells readers what to expect

**2. Supporting Sentences:**
- Provide details, examples, or evidence
- Explain and develop the main idea
- Usually 3-5 sentences

**3. Concluding Sentence:**
- Restates the main idea differently
- OR transitions to the next paragraph
- Gives a sense of completion

**Transition Words:**
- First, Second, Finally (sequence)
- However, Although, But (contrast)
- Therefore, Thus, So (result)
- For example, Such as (examples)`,
      },
      {
        type: 'examples',
        title: 'Paragraph Analysis',
        items: [
          { sentence: 'Learning a new language has many benefits.', explanation: 'Topic sentence - introduces the main idea' },
          { sentence: 'First, it improves brain function and memory.', explanation: 'Supporting detail #1 with transition word' },
          { sentence: 'Additionally, it opens doors to new career opportunities.', explanation: 'Supporting detail #2 with transition' },
          { sentence: 'Therefore, everyone should consider learning a second language.', explanation: 'Concluding sentence with result transition' },
        ],
      },
    ],
    exercises: [
      {
        id: 'ex1',
        type: 'multiple-choice',
        question: 'Where does the topic sentence usually appear?',
        options: ['At the end', 'In the middle', 'At the beginning', 'Anywhere'],
        correctAnswer: 2,
        explanation: 'The topic sentence is typically the first sentence of a paragraph.',
      },
      {
        id: 'ex2',
        type: 'multiple-choice',
        question: 'Which transition word shows contrast?',
        options: ['Therefore', 'However', 'First', 'For example'],
        correctAnswer: 1,
        explanation: '"However" is used to show contrast between ideas.',
      },
      {
        id: 'ex3',
        type: 'multiple-choice',
        question: 'How many supporting sentences should a paragraph usually have?',
        options: ['1-2', '3-5', '7-10', 'Only 1'],
        correctAnswer: 1,
        explanation: 'A typical paragraph has 3-5 supporting sentences.',
      },
    ],
  },
};

export const speakingLessons: Record<string, LessonContent> = {
  'speaking-1': {
    id: 'speaking-1',
    moduleId: 'speaking',
    title: 'Basic Pronunciation',
    duration: '15 min',
    sections: [
      {
        type: 'theory',
        title: 'English Sounds Overview',
        content: `English has 44 phonemes (distinct sounds), more than many other languages.

**Vowel Sounds:**
- Short vowels: /æ/ (cat), /e/ (bed), /ɪ/ (sit)
- Long vowels: /iː/ (see), /uː/ (blue), /ɑː/ (car)
- Diphthongs: /aɪ/ (my), /eɪ/ (day), /əʊ/ (go)

**Key Consonant Challenges:**
- /θ/ and /ð/ (think vs this) - put tongue between teeth
- /r/ vs /l/ - different tongue positions
- /v/ vs /w/ - lip and teeth contact

**Tips:**
- Practice with a mirror to see mouth position
- Record yourself and compare to native speakers
- Focus on problem sounds daily`,
      },
      {
        type: 'examples',
        title: 'Minimal Pairs Practice',
        items: [
          { sentence: 'ship vs sheep', explanation: '/ɪ/ vs /iː/ - short vs long vowel sound' },
          { sentence: 'think vs sink', explanation: '/θ/ vs /s/ - tongue between teeth vs behind teeth' },
          { sentence: 'right vs light', explanation: '/r/ vs /l/ - tongue curled back vs touching roof' },
          { sentence: 'vest vs west', explanation: '/v/ vs /w/ - teeth on lip vs rounded lips' },
        ],
      },
    ],
    exercises: [
      {
        id: 'ex1',
        type: 'multiple-choice',
        question: 'How many phonemes does English have?',
        options: ['24', '36', '44', '52'],
        correctAnswer: 2,
        explanation: 'English has 44 distinct sounds (phonemes).',
      },
      {
        id: 'ex2',
        type: 'multiple-choice',
        question: 'For the /θ/ sound (as in "think"), your tongue should be:',
        options: ['Behind your teeth', 'Between your teeth', 'At the roof of your mouth', 'Curled back'],
        correctAnswer: 1,
        explanation: 'The /θ/ sound requires putting your tongue between your teeth.',
      },
      {
        id: 'ex3',
        type: 'multiple-choice',
        question: 'Which pair shows a vowel length difference?',
        options: ['ship/sheep', 'think/sink', 'right/light', 'vest/west'],
        correctAnswer: 0,
        explanation: 'ship vs sheep shows short /ɪ/ vs long /iː/ vowel difference.',
      },
    ],
  },
  'speaking-2': {
    id: 'speaking-2',
    moduleId: 'speaking',
    title: 'Vowel Sounds',
    duration: '20 min',
    sections: [
      {
        type: 'theory',
        title: 'Mastering English Vowels',
        content: `English vowels can be tricky because spelling doesn't always match pronunciation.

**Short Vowels:**
- /æ/ - cat, bad, man
- /e/ - bed, red, head
- /ɪ/ - sit, him, fish
- /ɒ/ - hot, dog, box
- /ʌ/ - cup, but, love

**Long Vowels:**
- /iː/ - see, team, believe
- /ɑː/ - car, far, heart
- /ɔː/ - door, more, law
- /uː/ - blue, food, moon

**The Schwa /ə/:**
- Most common English sound
- Appears in unstressed syllables
- Examples: about, banana, problem`,
      },
      {
        type: 'examples',
        title: 'Vowel Practice',
        items: [
          { sentence: 'The cat sat on the mat.', explanation: 'Practice the /æ/ sound - jaw drops down' },
          { sentence: 'See the green leaves on the tree.', explanation: 'Practice /iː/ - smile position, tongue high' },
          { sentence: 'Put the book on the hook.', explanation: 'Practice /ʊ/ - rounded lips, short sound' },
          { sentence: 'I love my mother and brother.', explanation: 'Practice /ʌ/ - mouth slightly open, relaxed' },
        ],
      },
    ],
    exercises: [
      {
        id: 'ex1',
        type: 'multiple-choice',
        question: 'What is the most common vowel sound in English?',
        options: ['/æ/', '/iː/', '/ə/ (schwa)', '/ɑː/'],
        correctAnswer: 2,
        explanation: 'The schwa /ə/ is the most common sound, appearing in unstressed syllables.',
      },
      {
        id: 'ex2',
        type: 'multiple-choice',
        question: 'Which word contains the /ʌ/ sound?',
        options: ['cat', 'cup', 'car', 'coat'],
        correctAnswer: 1,
        explanation: '"Cup" contains the /ʌ/ sound - a short, open sound.',
      },
      {
        id: 'ex3',
        type: 'multiple-choice',
        question: 'The vowel sound in "see" and "team" is:',
        options: ['Short /ɪ/', 'Long /iː/', 'Schwa /ə/', 'Short /e/'],
        correctAnswer: 1,
        explanation: 'Both "see" and "team" have the long /iː/ sound.',
      },
    ],
  },
};