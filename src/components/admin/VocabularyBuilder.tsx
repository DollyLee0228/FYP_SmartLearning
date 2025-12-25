import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export interface VocabularyItem {
  id: string;
  word: string;
  definition: string;
  example: string;
  partOfSpeech: string;
}

interface VocabularyBuilderProps {
  items: VocabularyItem[];
  onChange: (items: VocabularyItem[]) => void;
}

export function VocabularyBuilder({ items, onChange }: VocabularyBuilderProps) {
  const addItem = () => {
    const newItem: VocabularyItem = {
      id: crypto.randomUUID(),
      word: '',
      definition: '',
      example: '',
      partOfSpeech: 'noun'
    };
    onChange([...items, newItem]);
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: string, value: string) => {
    onChange(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Vocabulary Words</Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addItem}
          className="gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Word
        </Button>
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
          <p className="text-muted-foreground text-sm">
            No vocabulary words added yet. Click "Add Word" to start.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {items.map((item, index) => (
          <div 
            key={item.id} 
            className="border border-border rounded-lg p-4 bg-background/50 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <GripVertical className="w-4 h-4" />
                <span className="font-medium text-foreground">Word {index + 1}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(item.id)}
                className="text-muted-foreground hover:text-destructive h-8 w-8"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor={`word-${item.id}`}>Word</Label>
                <Input
                  id={`word-${item.id}`}
                  value={item.word}
                  onChange={(e) => updateItem(item.id, 'word', e.target.value)}
                  placeholder="e.g., Eloquent"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`pos-${item.id}`}>Part of Speech</Label>
                <Input
                  id={`pos-${item.id}`}
                  value={item.partOfSpeech}
                  onChange={(e) => updateItem(item.id, 'partOfSpeech', e.target.value)}
                  placeholder="e.g., adjective"
                  className="bg-background border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`def-${item.id}`}>Definition</Label>
              <Input
                id={`def-${item.id}`}
                value={item.definition}
                onChange={(e) => updateItem(item.id, 'definition', e.target.value)}
                placeholder="e.g., Fluent or persuasive in speaking or writing"
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`example-${item.id}`}>Example Sentence</Label>
              <Textarea
                id={`example-${item.id}`}
                value={item.example}
                onChange={(e) => updateItem(item.id, 'example', e.target.value)}
                placeholder="e.g., She gave an eloquent speech at the conference."
                className="bg-background border-border"
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
