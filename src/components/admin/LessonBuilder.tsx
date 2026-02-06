import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface Section {
  id: string;
  type: 'content' | 'video' | 'audio';
  content: string;
}

interface Exercise {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface LessonData {
  introduction: {
    title: string;
    subtitle: string;
    summary: string;
  };
  sections: Section[];
  exercises: Exercise[];
}

interface LessonBuilderProps {
  data: LessonData;
  onChange: (data: LessonData) => void;
}

export function LessonBuilder({ data, onChange }: LessonBuilderProps) {
  // Update introduction
  const updateIntroduction = (field: string, value: string) => {
    onChange({
      ...data,
      introduction: {
        ...data.introduction,
        [field]: value
      }
    });
  };

  // Section management
  const addSection = () => {
    const newSection: Section = {
      id: `section-${data.sections.length + 1}`,
      type: 'content',
      content: ''
    };
    onChange({
      ...data,
      sections: [...data.sections, newSection]
    });
  };

  const removeSection = (id: string) => {
    onChange({
      ...data,
      sections: data.sections.filter(s => s.id !== id)
    });
  };

  const updateSection = (id: string, field: string, value: string) => {
    onChange({
      ...data,
      sections: data.sections.map(s =>
        s.id === id ? { ...s, [field]: value } : s
      )
    });
  };

  // Exercise management
  const addExercise = () => {
    const newExercise: Exercise = {
      id: `exercise-${data.exercises.length + 1}`,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    };
    onChange({
      ...data,
      exercises: [...data.exercises, newExercise]
    });
  };

  const removeExercise = (id: string) => {
    onChange({
      ...data,
      exercises: data.exercises.filter(e => e.id !== id)
    });
  };

  const updateExercise = (id: string, field: string, value: any) => {
    onChange({
      ...data,
      exercises: data.exercises.map(e =>
        e.id === id ? { ...e, [field]: value } : e
      )
    });
  };

  const updateExerciseOption = (exerciseId: string, optionIndex: number, value: string) => {
    onChange({
      ...data,
      exercises: data.exercises.map(e => {
        if (e.id === exerciseId) {
          const newOptions = [...e.options];
          newOptions[optionIndex] = value;
          return { ...e, options: newOptions };
        }
        return e;
      })
    });
  };

  return (
    <div className="space-y-6">
      {/* Introduction Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Introduction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="intro-title">Title</Label>
            <Input
              id="intro-title"
              value={data.introduction.title}
              onChange={(e) => updateIntroduction('title', e.target.value)}
              placeholder="e.g., Present Simple Tense - Daily Routines"
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="intro-subtitle">Subtitle</Label>
            <Input
              id="intro-subtitle"
              value={data.introduction.subtitle}
              onChange={(e) => updateIntroduction('subtitle', e.target.value)}
              placeholder="e.g., Master the Foundation of English"
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="intro-summary">Summary</Label>
            <Textarea
              id="intro-summary"
              value={data.introduction.summary}
              onChange={(e) => updateIntroduction('summary', e.target.value)}
              placeholder="Brief description of what students will learn..."
              className="bg-background border-border"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Content Sections</CardTitle>
          <Button variant="outline" size="sm" onClick={addSection}>
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.sections.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No sections yet. Click "Add Section" to start.
            </div>
          )}
          {data.sections.map((section, index) => (
            <div key={section.id} className="border border-border rounded-lg p-4 bg-background/50 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">Section {index + 1}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSection(section.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`section-type-${section.id}`}>Section Type</Label>
                <Select
                  value={section.type}
                  onValueChange={(value) => updateSection(section.id, 'type', value)}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="content">Text Content</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`section-content-${section.id}`}>
                  {section.type === 'content' ? 'Content (Markdown supported)' : 'URL'}
                </Label>
                <Textarea
                  id={`section-content-${section.id}`}
                  value={section.content}
                  onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                  placeholder={
                    section.type === 'content'
                      ? '# Heading\n\nYour content here...\n\n**Bold text** *Italic text*'
                      : 'https://...'
                  }
                  className="bg-background border-border font-mono text-sm"
                  rows={section.type === 'content' ? 8 : 2}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Exercises */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Exercises</CardTitle>
          <Button variant="outline" size="sm" onClick={addExercise}>
            <Plus className="w-4 h-4 mr-2" />
            Add Exercise
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.exercises.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No exercises yet. Click "Add Exercise" to start.
            </div>
          )}
          {data.exercises.map((exercise, index) => (
            <div key={exercise.id} className="border border-border rounded-lg p-4 bg-background/50 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">Exercise {index + 1}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeExercise(exercise.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`exercise-question-${exercise.id}`}>Question</Label>
                <Input
                  id={`exercise-question-${exercise.id}`}
                  value={exercise.question}
                  onChange={(e) => updateExercise(exercise.id, 'question', e.target.value)}
                  placeholder="e.g., She ___ to school every day."
                  className="bg-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label>Options</Label>
                <div className="space-y-2">
                  {exercise.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${exercise.id}`}
                        checked={exercise.correctAnswer === optIndex}
                        onChange={() => updateExercise(exercise.id, 'correctAnswer', optIndex)}
                        className="w-4 h-4 text-primary"
                      />
                      <Input
                        value={option}
                        onChange={(e) => updateExerciseOption(exercise.id, optIndex, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                        className="bg-background border-border flex-1"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select the correct answer by clicking the radio button
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`exercise-explanation-${exercise.id}`}>Explanation</Label>
                <Textarea
                  id={`exercise-explanation-${exercise.id}`}
                  value={exercise.explanation}
                  onChange={(e) => updateExercise(exercise.id, 'explanation', e.target.value)}
                  placeholder="Explain why this is the correct answer..."
                  className="bg-background border-border"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}