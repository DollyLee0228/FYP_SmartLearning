import { QuizQuestion } from '@/types/learning';

export const levelAssessmentQuestions: QuizQuestion[] = [
  // A1 Level Questions
  {
    id: 'a1-1',
    question: 'What is the correct form? "She ___ a teacher."',
    options: ['am', 'is', 'are', 'be'],
    correctAnswer: 1,
    difficulty: 'A1',
  },
  {
    id: 'a1-2',
    question: 'Choose the correct word: "I have two ___."',
    options: ['child', 'childs', 'children', 'childrens'],
    correctAnswer: 2,
    difficulty: 'A1',
  },
  {
    id: 'a1-3',
    question: 'What color is the sky on a sunny day?',
    options: ['Green', 'Blue', 'Red', 'Yellow'],
    correctAnswer: 1,
    difficulty: 'A1',
  },
  // A2 Level Questions
  {
    id: 'a2-1',
    question: 'Complete: "I ___ to the cinema yesterday."',
    options: ['go', 'went', 'gone', 'going'],
    correctAnswer: 1,
    difficulty: 'A2',
  },
  {
    id: 'a2-2',
    question: 'Which is correct? "There are ___ apples on the table."',
    options: ['much', 'any', 'some', 'a'],
    correctAnswer: 2,
    difficulty: 'A2',
  },
  {
    id: 'a2-3',
    question: 'Choose the opposite of "expensive":',
    options: ['Cheap', 'Rich', 'Beautiful', 'Heavy'],
    correctAnswer: 0,
    difficulty: 'A2',
  },
  // B1 Level Questions
  {
    id: 'b1-1',
    question: 'Select the correct sentence:',
    options: [
      'If I will see him, I tell him.',
      'If I see him, I will tell him.',
      'If I saw him, I will tell him.',
      'If I see him, I would tell him.',
    ],
    correctAnswer: 1,
    difficulty: 'B1',
  },
  {
    id: 'b1-2',
    question: 'Choose the correct word: "He\'s been working here ___ five years."',
    options: ['since', 'for', 'during', 'while'],
    correctAnswer: 1,
    difficulty: 'B1',
  },
  {
    id: 'b1-3',
    question: '"Despite ___ tired, she continued working."',
    options: ['be', 'being', 'to be', 'been'],
    correctAnswer: 1,
    difficulty: 'B1',
  },
  // B2 Level Questions
  {
    id: 'b2-1',
    question: 'Which sentence is grammatically correct?',
    options: [
      'Had I known, I would have helped.',
      'If I would know, I had helped.',
      'Had I knew, I would helped.',
      'If I had knew, I would have helped.',
    ],
    correctAnswer: 0,
    difficulty: 'B2',
  },
  {
    id: 'b2-2',
    question: 'Choose the best word: "The proposal was ___ by the committee."',
    options: ['turned down', 'turned up', 'turned on', 'turned over'],
    correctAnswer: 0,
    difficulty: 'B2',
  },
  {
    id: 'b2-3',
    question: '"Not only ___ the test, but he also got the highest score."',
    options: ['he passed', 'did he pass', 'he did pass', 'passed he'],
    correctAnswer: 1,
    difficulty: 'B2',
  },
  // C1 Level Questions
  {
    id: 'c1-1',
    question: 'Select the most appropriate word: "The minister\'s remarks were taken out of ___ by the media."',
    options: ['context', 'content', 'contact', 'contract'],
    correctAnswer: 0,
    difficulty: 'C1',
  },
  {
    id: 'c1-2',
    question: 'Which phrase means "to avoid dealing with something"?',
    options: ['Beat around the bush', 'Bite the bullet', 'Break the ice', 'Burn bridges'],
    correctAnswer: 0,
    difficulty: 'C1',
  },
  {
    id: 'c1-3',
    question: '"The theory, ___ controversial, has gained significant support."',
    options: ['albeit', 'despite', 'although being', 'however'],
    correctAnswer: 0,
    difficulty: 'C1',
  },
  // C2 Level Questions
  {
    id: 'c2-1',
    question: 'Which word best completes: "His argument was completely ___; it lacked any logical foundation."',
    options: ['specious', 'spurious', 'superficial', 'superfluous'],
    correctAnswer: 0,
    difficulty: 'C2',
  },
  {
    id: 'c2-2',
    question: 'The phrase "hoist by one\'s own petard" means:',
    options: [
      'Harmed by one\'s own plan',
      'Lifted by success',
      'Trapped by circumstances',
      'Overwhelmed by emotion',
    ],
    correctAnswer: 0,
    difficulty: 'C2',
  },
  {
    id: 'c2-3',
    question: 'Which sentence demonstrates correct use of the subjunctive?',
    options: [
      'I wish he was here.',
      'If I was you, I would go.',
      'It is vital that he be present.',
      'I suggest that he goes immediately.',
    ],
    correctAnswer: 2,
    difficulty: 'C2',
  },
];

export const getQuestionsForAssessment = (): QuizQuestion[] => {
  // Return a balanced mix of questions from each level
  return levelAssessmentQuestions;
};
