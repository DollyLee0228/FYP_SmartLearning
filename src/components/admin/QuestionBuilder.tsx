import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2, GripVertical, Link } from 'lucide-react';

export type QuestionType = 'multiple-choice' | 'type-answer';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  audioUrl?: string; // For listening mode where each question has its own audio
  questionType?: QuestionType; // For listening: multiple-choice or type-answer
  expectedAnswer?: string; // For type-answer questions
}

interface QuestionBuilderProps {
  questions: Question[];
  onChange: (questions: Question[]) => void;
  label?: string;
  questionPlaceholder?: string;
  showOptions?: boolean; // For speaking/writing prompts, we don't need options
  showAudioUrl?: boolean; // For single-question listening mode
}

export function QuestionBuilder({ 
  questions, 
  onChange, 
  label = 'Questions',
  questionPlaceholder = 'Enter your question',
  showOptions = true,
  showAudioUrl = false
}: QuestionBuilderProps) {
  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      question: '',
      options: showOptions ? ['', '', '', ''] : [],
      correctAnswer: 0,
      audioUrl: '',
      questionType: 'multiple-choice',
      expectedAnswer: ''
    };
    onChange([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    onChange(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, field: string, value: string | number) => {
    onChange(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    onChange(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const addOption = (questionId: string) => {
    onChange(questions.map(q => {
      if (q.id === questionId && q.options.length < 6) {
        return { ...q, options: [...q.options, ''] };
      }
      return q;
    }));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    onChange(questions.map(q => {
      if (q.id === questionId && q.options.length > 2) {
        const newOptions = q.options.filter((_, i) => i !== optionIndex);
        const newCorrectAnswer = q.correctAnswer >= optionIndex && q.correctAnswer > 0 
          ? q.correctAnswer - 1 
          : q.correctAnswer;
        return { ...q, options: newOptions, correctAnswer: Math.min(newCorrectAnswer, newOptions.length - 1) };
      }
      return q;
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">{label}</Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addQuestion}
          className="gap-1"
        >
          <Plus className="w-4 h-4" />
          Add {showOptions ? 'Question' : 'Prompt'}
        </Button>
      </div>

      {questions.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
          <p className="text-muted-foreground text-sm">
            No {showOptions ? 'questions' : 'prompts'} added yet. Click "Add {showOptions ? 'Question' : 'Prompt'}" to start.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {questions.map((q, qIndex) => (
          <div 
            key={q.id} 
            className="border border-border rounded-lg p-4 bg-background/50 space-y-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <GripVertical className="w-4 h-4" />
                <span className="font-medium text-foreground">
                  {showOptions ? 'Question' : 'Prompt'} {qIndex + 1}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeQuestion(q.id)}
                className="text-muted-foreground hover:text-destructive h-8 w-8"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Audio URL for single listening mode */}
            {showAudioUrl && (
              <>
                <div className="space-y-2">
                  <Label htmlFor={`audio-${q.id}`}>Audio URL</Label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id={`audio-${q.id}`}
                      value={q.audioUrl || ''}
                      onChange={(e) => updateQuestion(q.id, 'audioUrl', e.target.value)}
                      placeholder="https://... (audio file URL or YouTube link)"
                      className="pl-10 bg-background border-border"
                    />
                  </div>
                </div>

                {/* Question Type Selector for single listening */}
                <div className="space-y-2">
                  <Label>Answer Type</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={q.questionType === 'multiple-choice' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateQuestion(q.id, 'questionType', 'multiple-choice')}
                      className="flex-1"
                    >
                      Multiple Choice
                    </Button>
                    <Button
                      type="button"
                      variant={q.questionType === 'type-answer' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateQuestion(q.id, 'questionType', 'type-answer')}
                      className="flex-1"
                    >
                      Type Answer
                    </Button>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor={`question-${q.id}`}>
                {showOptions ? 'Question Text' : 'Prompt Text'}
              </Label>
              <Textarea
                id={`question-${q.id}`}
                value={q.question}
                onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                placeholder={questionPlaceholder}
                className="bg-background border-border"
                rows={2}
              />
            </div>

            {/* Expected Answer for type-answer questions in single listening mode */}
            {showAudioUrl && q.questionType === 'type-answer' && (
              <div className="space-y-2">
                <Label htmlFor={`expected-${q.id}`}>Expected Answer</Label>
                <Input
                  id={`expected-${q.id}`}
                  value={q.expectedAnswer || ''}
                  onChange={(e) => updateQuestion(q.id, 'expectedAnswer', e.target.value)}
                  placeholder="The correct answer the user should type"
                  className="bg-background border-border"
                />
              </div>
            )}

            {/* Multiple choice options - show if showOptions is true AND (not single listening mode OR questionType is multiple-choice) */}
            {showOptions && (!showAudioUrl || q.questionType === 'multiple-choice') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Options (select the correct answer)</Label>
                  {q.options.length < 6 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => addOption(q.id)}
                      className="text-xs h-7"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Option
                    </Button>
                  )}
                </div>
                <RadioGroup 
                  value={q.correctAnswer.toString()} 
                  onValueChange={(value) => updateQuestion(q.id, 'correctAnswer', parseInt(value))}
                  className="space-y-2"
                >
                  {q.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      <RadioGroupItem 
                        value={optIndex.toString()} 
                        id={`option-${q.id}-${optIndex}`}
                        className="border-primary"
                      />
                      <Input
                        value={option}
                        onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                        className="flex-1 bg-background border-border"
                      />
                      {q.options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(q.id, optIndex)}
                          className="text-muted-foreground hover:text-destructive h-8 w-8"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
