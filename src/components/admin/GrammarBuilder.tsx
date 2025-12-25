import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export interface GrammarRule {
  id: string;
  rule: string;
  explanation: string;
  correctExample: string;
  incorrectExample: string;
}

interface GrammarBuilderProps {
  rules: GrammarRule[];
  onChange: (rules: GrammarRule[]) => void;
}

export function GrammarBuilder({ rules, onChange }: GrammarBuilderProps) {
  const addRule = () => {
    const newRule: GrammarRule = {
      id: crypto.randomUUID(),
      rule: '',
      explanation: '',
      correctExample: '',
      incorrectExample: ''
    };
    onChange([...rules, newRule]);
  };

  const removeRule = (id: string) => {
    onChange(rules.filter(rule => rule.id !== id));
  };

  const updateRule = (id: string, field: string, value: string) => {
    onChange(rules.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Grammar Rules</Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addRule}
          className="gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </Button>
      </div>

      {rules.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
          <p className="text-muted-foreground text-sm">
            No grammar rules added yet. Click "Add Rule" to start.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {rules.map((rule, index) => (
          <div 
            key={rule.id} 
            className="border border-border rounded-lg p-4 bg-background/50 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <GripVertical className="w-4 h-4" />
                <span className="font-medium text-foreground">Rule {index + 1}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeRule(rule.id)}
                className="text-muted-foreground hover:text-destructive h-8 w-8"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`rule-${rule.id}`}>Rule Title</Label>
              <Input
                id={`rule-${rule.id}`}
                value={rule.rule}
                onChange={(e) => updateRule(rule.id, 'rule', e.target.value)}
                placeholder="e.g., Subject-Verb Agreement"
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`explanation-${rule.id}`}>Explanation</Label>
              <Textarea
                id={`explanation-${rule.id}`}
                value={rule.explanation}
                onChange={(e) => updateRule(rule.id, 'explanation', e.target.value)}
                placeholder="Explain the grammar rule in detail..."
                className="bg-background border-border"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor={`correct-${rule.id}`} className="text-green-500">
                  ✓ Correct Example
                </Label>
                <Input
                  id={`correct-${rule.id}`}
                  value={rule.correctExample}
                  onChange={(e) => updateRule(rule.id, 'correctExample', e.target.value)}
                  placeholder="e.g., She walks to school."
                  className="bg-background border-border border-green-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`incorrect-${rule.id}`} className="text-destructive">
                  ✗ Incorrect Example
                </Label>
                <Input
                  id={`incorrect-${rule.id}`}
                  value={rule.incorrectExample}
                  onChange={(e) => updateRule(rule.id, 'incorrectExample', e.target.value)}
                  placeholder="e.g., She walk to school."
                  className="bg-background border-border border-destructive/30"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
