import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface ReadingExercise {
  id: string;
  title: string;
  passage: string;
  questions: Question[];
}

const readingExercises: Record<string, ReadingExercise> = {
  'reading-1': {
    id: 'reading-1',
    title: 'The Little Prince - Excerpt',
    passage: `Once when I was six years old I saw a magnificent picture in a book, called True Stories from Nature, about the primeval forest. It was a picture of a boa constrictor in the act of swallowing an animal. Here is a copy of the drawing.

In the book it said: "Boa constrictors swallow their prey whole, without chewing it. After that they are not able to move, and they sleep through the six months that they need for digestion."

I pondered deeply, then, over the adventures of the jungle. And after some work with a colored pencil I succeeded in making my first drawing. My Drawing Number One. It looked something like this.

I showed my masterpiece to the grown-ups, and asked them whether the drawing frightened them.

But they answered: "Frighten? Why should anyone be frightened by a hat?"

My drawing was not a picture of a hat. It was a picture of a boa constrictor digesting an elephant. But since the grown-ups were not able to understand it, I made another drawing: I drew the inside of a boa constrictor, so that the grown-ups could see it clearly. They always need to have things explained.`,
    questions: [
      {
        id: 1,
        question: 'How old was the narrator when he saw the picture?',
        options: ['Five years old', 'Six years old', 'Seven years old', 'Eight years old'],
        correctAnswer: 1
      },
      {
        id: 2,
        question: 'What was the picture about?',
        options: ['A hat', 'An elephant', 'A boa constrictor swallowing an animal', 'A jungle adventure'],
        correctAnswer: 2
      },
      {
        id: 3,
        question: 'How long do boa constrictors need to digest their prey?',
        options: ['Three months', 'Four months', 'Five months', 'Six months'],
        correctAnswer: 3
      },
      {
        id: 4,
        question: 'What did the grown-ups think the drawing was?',
        options: ['A snake', 'A hat', 'An elephant', 'A jungle'],
        correctAnswer: 1
      },
      {
        id: 5,
        question: 'Why did the narrator make a second drawing?',
        options: [
          'Because he wanted to practice',
          'Because the first one was ugly',
          'So the grown-ups could understand',
          'Because his teacher asked him to'
        ],
        correctAnswer: 2
      }
    ]
  },
  'reading-2': {
    id: 'reading-2',
    title: 'Climate Change and Its Effects',
    passage: `Climate change refers to long-term shifts in temperatures and weather patterns. These shifts may be natural, but since the 1800s, human activities have been the main driver of climate change, primarily due to burning fossil fuels like coal, oil and gas.

Burning fossil fuels generates greenhouse gas emissions that act like a blanket wrapped around the Earth, trapping the sun's heat and raising temperatures. Examples of greenhouse gas emissions that are causing climate change include carbon dioxide and methane. These come from using gasoline for driving a car or coal for heating a building, for example.

The consequences of climate change now include, among others, intense droughts, water scarcity, severe fires, rising sea levels, flooding, melting polar ice, catastrophic storms and declining biodiversity.

People are experiencing climate change in diverse ways. Climate change can affect our health, ability to grow food, housing, safety and work. Some of us are already more vulnerable to climate impacts, such as people living in small island nations and other developing countries.

Conditions like sea-level rise and saltwater intrusion have advanced to the point where whole communities have had to relocate, and protracted droughts are putting people at risk of famine.`,
    questions: [
      {
        id: 1,
        question: 'What has been the main driver of climate change since the 1800s?',
        options: ['Natural cycles', 'Human activities', 'Solar flares', 'Volcanic eruptions'],
        correctAnswer: 1
      },
      {
        id: 2,
        question: 'What do greenhouse gas emissions do?',
        options: [
          'Cool down the Earth',
          'Create oxygen',
          'Trap the sun\'s heat',
          'Block sunlight'
        ],
        correctAnswer: 2
      },
      {
        id: 3,
        question: 'Which is NOT mentioned as a consequence of climate change?',
        options: ['Rising sea levels', 'Severe fires', 'Earthquakes', 'Melting polar ice'],
        correctAnswer: 2
      },
      {
        id: 4,
        question: 'Who are mentioned as being more vulnerable to climate impacts?',
        options: [
          'People in large cities',
          'People in small island nations',
          'People in cold climates',
          'People in forests'
        ],
        correctAnswer: 1
      },
      {
        id: 5,
        question: 'What has caused whole communities to relocate?',
        options: [
          'Job opportunities',
          'Better weather',
          'Sea-level rise and saltwater intrusion',
          'Population growth'
        ],
        correctAnswer: 2
      }
    ]
  }
};

export default function ReadingExercisePage() {
  const navigate = useNavigate();
  const { exerciseId } = useParams();
  const exercise = readingExercises[exerciseId || ''];
  
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  if (!exercise) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Exercise not found</h1>
          <Button onClick={() => navigate('/modules/reading')}>Back to Reading</Button>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    setSubmitted(true);
    setShowResults(true);
  };

  const correctCount = exercise.questions.filter(
    q => answers[q.id] === q.correctAnswer
  ).length;

  const score = Math.round((correctCount / exercise.questions.length) * 100);

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Header */}
      <div className="bg-[#111827] border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate('/modules/reading')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Reading
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold">{exercise.title}</h1>
              <p className="text-sm text-gray-400">Read the passage and answer the questions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Reading Passage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111827] rounded-xl border border-white/10 p-6 mb-8"
        >
          <h2 className="text-lg font-semibold mb-4 text-blue-400">Reading Passage</h2>
          <div className="prose prose-invert max-w-none">
            {exercise.passage.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-gray-300 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </motion.div>

        {/* Results Summary */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl border p-6 mb-8 ${
              score >= 80
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : score >= 60
                ? 'bg-yellow-500/10 border-yellow-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Your Score</h3>
                <p className="text-gray-400">
                  {correctCount} of {exercise.questions.length} correct
                </p>
              </div>
              <div className={`text-4xl font-bold ${
                score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {score}%
              </div>
            </div>
          </motion.div>
        )}

        {/* Questions */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Comprehension Questions</h2>
          {exercise.questions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#111827] rounded-xl border border-white/10 p-6"
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-semibold shrink-0">
                  {index + 1}
                </span>
                <h3 className="font-medium text-white pt-1">{question.question}</h3>
              </div>
              
              <RadioGroup
                value={answers[question.id]?.toString()}
                onValueChange={(value) => {
                  if (!submitted) {
                    setAnswers(prev => ({ ...prev, [question.id]: parseInt(value) }));
                  }
                }}
                disabled={submitted}
                className="space-y-3 ml-11"
              >
                {question.options.map((option, optIndex) => {
                  const isSelected = answers[question.id] === optIndex;
                  const isCorrect = question.correctAnswer === optIndex;
                  const showCorrectness = submitted;
                  
                  return (
                    <div
                      key={optIndex}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                        showCorrectness
                          ? isCorrect
                            ? 'border-emerald-500/50 bg-emerald-500/10'
                            : isSelected
                            ? 'border-red-500/50 bg-red-500/10'
                            : 'border-white/10 bg-white/5'
                          : isSelected
                          ? 'border-blue-500/50 bg-blue-500/10'
                          : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                      }`}
                    >
                      <RadioGroupItem
                        value={optIndex.toString()}
                        id={`q${question.id}-opt${optIndex}`}
                        className="border-white/30"
                      />
                      <Label
                        htmlFor={`q${question.id}-opt${optIndex}`}
                        className="flex-1 cursor-pointer text-gray-300"
                      >
                        {option}
                      </Label>
                      {showCorrectness && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      )}
                      {showCorrectness && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                  );
                })}
              </RadioGroup>
            </motion.div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-center gap-4">
          {!submitted ? (
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < exercise.questions.length}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8"
            >
              Submit Answers
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                  setShowResults(false);
                }}
                className="border-white/10 text-gray-300 hover:bg-white/5"
              >
                Try Again
              </Button>
              <Button
                size="lg"
                onClick={() => navigate('/modules/reading')}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
              >
                Back to Reading
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
