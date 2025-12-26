import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen,
  FileText,
  Video,
  Upload,
  File,
  Link,
  X,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { QuestionBuilder, Question } from './QuestionBuilder';
import { VocabularyBuilder, VocabularyItem } from './VocabularyBuilder';
import { GrammarBuilder, GrammarRule } from './GrammarBuilder';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  level: string;
  category: string;
  status: string;
  description?: string | null;
  file_url?: string | null;
  file_name?: string | null;
  youtube_url?: string | null;
  questions?: string | null;
  passage?: string | null;
  created_at: string;
  updated_at: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  lesson: <BookOpen className="w-4 h-4" />,
  quiz: <FileText className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
};

const typeColors: Record<string, string> = {
  lesson: 'bg-blue-500/20 text-blue-400',
  quiz: 'bg-orange-500/20 text-orange-400',
  video: 'bg-pink-500/20 text-pink-400',
};

const statusColors: Record<string, string> = {
  published: 'bg-green-500/20 text-green-400',
  draft: 'bg-yellow-500/20 text-yellow-400',
};

// Category-specific field configurations
type CategoryConfig = { 
  showAudio: boolean; 
  showPassage: boolean; 
  showQuestions: boolean; 
  showVideoUpload: boolean;
  showYoutubeUrl: boolean;
  showGrammarBuilder: boolean;
  showVocabularyBuilder: boolean;
  showListeningModeSelector: boolean;
  audioLabel?: string;
  passageLabel?: string;
  questionsLabel?: string;
  questionPlaceholder?: string;
  showOptions?: boolean;
};

const categoryFieldConfig: Record<string, CategoryConfig> = {
  Grammar: { 
    showAudio: false, 
    showPassage: false, 
    showQuestions: true, 
    showVideoUpload: false, 
    showYoutubeUrl: false, 
    showGrammarBuilder: true,
    showVocabularyBuilder: false,
    showListeningModeSelector: false,
    questionsLabel: 'Grammar Questions (Multiple Choice)',
    questionPlaceholder: 'Choose the correct form of the verb...',
    showOptions: true
  },
  Vocabulary: { 
    showAudio: false, 
    showPassage: false, 
    showQuestions: false, 
    showVideoUpload: false, 
    showYoutubeUrl: false, 
    showGrammarBuilder: false,
    showVocabularyBuilder: true,
    showListeningModeSelector: false
  },
  Reading: { 
    showAudio: false, 
    showPassage: true, 
    showQuestions: true, 
    showVideoUpload: false, 
    showYoutubeUrl: false, 
    showGrammarBuilder: false,
    showVocabularyBuilder: false,
    showListeningModeSelector: false,
    passageLabel: 'Reading Passage / Article',
    questionsLabel: 'Comprehension Questions',
    questionPlaceholder: 'What is the main idea of the passage?',
    showOptions: true
  },
  Listening: { 
    showAudio: true, 
    showPassage: false, 
    showQuestions: true, 
    showVideoUpload: false, 
    showYoutubeUrl: true, 
    showGrammarBuilder: false,
    showVocabularyBuilder: false,
    showListeningModeSelector: true,
    audioLabel: 'Upload Audio File',
    questionsLabel: 'Listening Questions',
    questionPlaceholder: 'What did the speaker say about...?',
    showOptions: true
  },
  Writing: { 
    showAudio: false, 
    showPassage: false, 
    showQuestions: true, 
    showVideoUpload: false, 
    showYoutubeUrl: false, 
    showGrammarBuilder: false,
    showVocabularyBuilder: false,
    showListeningModeSelector: false,
    questionsLabel: 'Writing Prompts',
    questionPlaceholder: 'Write an essay about...',
    showOptions: false
  },
  Speaking: { 
    showAudio: false, 
    showPassage: false, 
    showQuestions: true, 
    showVideoUpload: false, 
    showYoutubeUrl: false, 
    showGrammarBuilder: false,
    showVocabularyBuilder: false,
    showListeningModeSelector: false,
    questionsLabel: 'Speaking Prompts',
    questionPlaceholder: 'Describe a time when you...',
    showOptions: false
  },
};

export function ContentManagement() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeContentTab, setActiveContentTab] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [newContent, setNewContent] = useState({
    title: '',
    type: 'lesson' as 'lesson' | 'quiz' | 'video',
    level: 'A1',
    category: 'Grammar',
    description: '',
    youtube_url: '',
    passage: ''
  });

  // Builder states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItem[]>([]);
  
  // Listening mode: 'single' = one question per audio, 'multiple' = many questions per audio
  const [listeningMode, setListeningMode] = useState<'single' | 'multiple'>('multiple');
  const [grammarRules, setGrammarRules] = useState<GrammarRule[]>([]);

  // Fetch content from database
  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const filteredContent = content.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeContentTab === 'all' || item.type === activeContentTab;
    return matchesSearch && matchesType;
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const categoryConfig = categoryFieldConfig[newContent.category] || categoryFieldConfig['Grammar'];
      
      // Validate file type based on category
      if (categoryConfig.showAudio) {
        const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/m4a'];
        if (!validAudioTypes.includes(file.type)) {
          toast.error('Please upload a valid audio file (MP3, WAV, OGG, M4A)');
          return;
        }
      } else if (newContent.type === 'video') {
        const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
        if (!validVideoTypes.includes(file.type)) {
          toast.error('Please upload a valid video file (MP4, WebM, OGG, MOV)');
          return;
        }
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<{ url: string; name: string } | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${newContent.type}s/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('admin-content')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('admin-content')
      .getPublicUrl(filePath);

    return { url: publicUrl, name: file.name };
  };

  const handleAddContent = async () => {
    if (!newContent.title) {
      toast.error('Please enter a title');
      return;
    }

    const categoryConfig = categoryFieldConfig[newContent.category] || categoryFieldConfig['Grammar'];
    
    // Validate based on category
    // For listening with 'multiple' mode, require shared audio; for 'single' mode, each question has its own audio
    if (categoryConfig.showAudio && listeningMode === 'multiple' && !selectedFile && !newContent.youtube_url) {
      toast.error('Please upload an audio file or provide a link');
      return;
    }
    
    if (categoryConfig.showQuestions && questions.length === 0) {
      toast.error('Please add at least one question/prompt');
      return;
    }
    
    if (categoryConfig.showPassage && !newContent.passage.trim()) {
      toast.error('Please enter the reading passage');
      return;
    }

    if (categoryConfig.showGrammarBuilder && grammarRules.length === 0) {
      toast.error('Please add at least one grammar rule');
      return;
    }

    if (categoryConfig.showVocabularyBuilder && vocabularyItems.length === 0) {
      toast.error('Please add at least one vocabulary word');
      return;
    }

    setUploading(true);
    try {
      let fileData: { url: string; name: string } | null = null;

      if (selectedFile) {
        fileData = await uploadFile(selectedFile);
      }

      const { data: userData } = await supabase.auth.getUser();

      // Serialize the appropriate data based on category
      let questionsData: string | null = null;
      if (categoryConfig.showQuestions) {
        // For listening, include the mode in the data
        if (categoryConfig.showListeningModeSelector) {
          questionsData = JSON.stringify({ mode: listeningMode, questions });
        } else {
          questionsData = JSON.stringify(questions);
        }
      } else if (categoryConfig.showGrammarBuilder) {
        questionsData = JSON.stringify({ grammarRules, questions });
      } else if (categoryConfig.showVocabularyBuilder) {
        questionsData = JSON.stringify(vocabularyItems);
      }

      const { error } = await supabase
        .from('admin_content')
        .insert({
          title: newContent.title,
          type: newContent.type,
          level: newContent.level,
          category: newContent.category,
          description: newContent.description,
          file_url: fileData?.url || null,
          file_name: fileData?.name || null,
          youtube_url: newContent.youtube_url || null,
          questions: questionsData,
          passage: newContent.passage || null,
          created_by: userData?.user?.id
        });

      if (error) throw error;

      await fetchContent();
      resetAddDialog();
      toast.success(`${newContent.type.charAt(0).toUpperCase() + newContent.type.slice(1)} created successfully`);
    } catch (error) {
      console.error('Error adding content:', error);
      toast.error('Failed to create content');
    } finally {
      setUploading(false);
    }
  };

  const handleEditContent = async () => {
    if (!selectedContent) return;
    
    try {
      const { error } = await supabase
        .from('admin_content')
        .update({
          title: selectedContent.title,
          level: selectedContent.level,
          category: selectedContent.category,
          status: selectedContent.status,
          description: selectedContent.description,
          youtube_url: selectedContent.youtube_url
        })
        .eq('id', selectedContent.id);

      if (error) throw error;

      await fetchContent();
      setIsEditDialogOpen(false);
      toast.success('Content updated successfully');
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error('Failed to update content');
    }
  };

  const handleDeleteContent = async (id: string) => {
    try {
      const item = content.find(c => c.id === id);
      
      // Delete file from storage if exists
      if (item?.file_url) {
        const filePath = item.file_url.split('/').slice(-2).join('/');
        await supabase.storage.from('admin-content').remove([filePath]);
      }

      const { error } = await supabase
        .from('admin_content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContent(content.filter((item) => item.id !== id));
      toast.success('Content deleted successfully');
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  };

  const openEditDialog = (item: ContentItem) => {
    setSelectedContent(item);
    setIsEditDialogOpen(true);
  };

  const resetAddDialog = () => {
    setNewContent({ title: '', type: 'lesson', level: 'A1', category: 'Grammar', description: '', youtube_url: '', passage: '' });
    setSelectedFile(null);
    setQuestions([]);
    setVocabularyItems([]);
    setGrammarRules([]);
    setListeningMode('multiple');
    setIsAddDialogOpen(false);
  };

  const getAcceptedFileTypes = () => {
    const categoryConfig = categoryFieldConfig[newContent.category] || categoryFieldConfig['Grammar'];
    
    if (categoryConfig.showAudio) {
      return 'audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm,.mp3,.wav,.ogg,.m4a';
    }
    if (newContent.type === 'video') {
      return 'video/mp4,video/webm,video/ogg,video/quicktime';
    }
    return '.pdf,.doc,.docx';
  };
  
  const getCategoryConfig = () => {
    return categoryFieldConfig[newContent.category] || categoryFieldConfig['Grammar'];
  };

  // Reset builders when category changes
  useEffect(() => {
    setQuestions([]);
    setVocabularyItems([]);
    setGrammarRules([]);
    setSelectedFile(null);
    setListeningMode('multiple');
    setNewContent(prev => ({ ...prev, youtube_url: '', passage: '' }));
  }, [newContent.category]);

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">Content Management</CardTitle>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90">
          <Upload className="w-4 h-4 mr-2" />
          Upload Content
        </Button>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
          <Tabs value={activeContentTab} onValueChange={setActiveContentTab}>
            <TabsList className="bg-background border border-border">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="lesson">Lessons</TabsTrigger>
              <TabsTrigger value="quiz">Quizzes</TabsTrigger>
              <TabsTrigger value="video">Videos</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content Table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Title</TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Level</TableHead>
                <TableHead className="text-muted-foreground">Category</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">File/Link</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContent.map((item) => (
                <TableRow key={item.id} className="border-border hover:bg-muted/50">
                  <TableCell className="font-medium text-foreground">{item.title}</TableCell>
                  <TableCell>
                    <Badge className={typeColors[item.type]}>
                      <span className="flex items-center gap-1">
                        {typeIcons[item.type]}
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-primary/50 text-primary">
                      {item.level}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.category}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[item.status]}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.file_url && (
                      <a 
                        href={item.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline text-sm"
                      >
                        <File className="w-3 h-3" />
                        {item.file_name || 'View File'}
                      </a>
                    )}
                    {item.youtube_url && (
                      <a 
                        href={item.youtube_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline text-sm"
                      >
                        <Link className="w-3 h-3" />
                        Audio/Video Link
                      </a>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(item)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteContent(item.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredContent.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No content found matching your search.
          </div>
        )}
      </CardContent>

      {/* Add Content Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => !open && resetAddDialog()}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-foreground">Upload New Content</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-140px)] pr-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newContent.title}
                  onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                  placeholder="Enter content title"
                  className="bg-background border-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Content Type</Label>
                  <Select 
                    value={newContent.type} 
                    onValueChange={(value: 'lesson' | 'quiz' | 'video') => {
                      setNewContent({ ...newContent, type: value, youtube_url: '' });
                      setSelectedFile(null);
                    }}
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lesson">Lesson</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select value={newContent.level} onValueChange={(value) => setNewContent({ ...newContent, level: value })}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A1">A1</SelectItem>
                      <SelectItem value="A2">A2</SelectItem>
                      <SelectItem value="B1">B1</SelectItem>
                      <SelectItem value="B2">B2</SelectItem>
                      <SelectItem value="C1">C1</SelectItem>
                      <SelectItem value="C2">C2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newContent.category} onValueChange={(value) => setNewContent({ ...newContent, category: value })}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grammar">Grammar</SelectItem>
                    <SelectItem value="Vocabulary">Vocabulary</SelectItem>
                    <SelectItem value="Reading">Reading</SelectItem>
                    <SelectItem value="Listening">Listening</SelectItem>
                    <SelectItem value="Writing">Writing</SelectItem>
                    <SelectItem value="Speaking">Speaking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Category-specific fields */}
              {(() => {
                const config = getCategoryConfig();
                return (
                  <>
                    {/* Grammar Builder */}
                    {config.showGrammarBuilder && (
                      <GrammarBuilder 
                        rules={grammarRules} 
                        onChange={setGrammarRules} 
                      />
                    )}

                    {/* Vocabulary Builder */}
                    {config.showVocabularyBuilder && (
                      <VocabularyBuilder 
                        items={vocabularyItems} 
                        onChange={setVocabularyItems} 
                      />
                    )}

                    {/* Listening Mode Selector */}
                    {config.showListeningModeSelector && (
                      <div className="space-y-2">
                        <Label>Listening Format</Label>
                        <Select value={listeningMode} onValueChange={(v: 'single' | 'multiple') => {
                          setListeningMode(v);
                          setQuestions([]);
                        }}>
                          <SelectTrigger className="bg-background border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">One audio file per question</SelectItem>
                            <SelectItem value="multiple">One audio file with multiple questions</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          {listeningMode === 'single' 
                            ? 'Each question will have its own audio file or URL' 
                            : 'One audio file for all questions below'}
                        </p>
                      </div>
                    )}

                    {/* Audio Upload for Listening (only for 'multiple' mode) */}
                    {config.showAudio && listeningMode === 'multiple' && (
                      <div className="space-y-2">
                        <Label>{config.audioLabel || 'Upload Audio'}</Label>
                        <div className="border-2 border-dashed border-border rounded-lg p-4">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept={getAcceptedFileTypes()}
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          {selectedFile ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <File className="w-5 h-5 text-primary" />
                                <span className="text-sm text-foreground truncate max-w-[200px]">
                                  {selectedFile.name}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedFile(null)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div 
                              className="flex flex-col items-center gap-2 cursor-pointer"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="w-8 h-8 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Click to upload audio (MP3, WAV, OGG, M4A)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* YouTube/Audio URL for Listening (only for 'multiple' mode) */}
                    {config.showYoutubeUrl && listeningMode === 'multiple' && (
                      <div className="space-y-2">
                        <Label htmlFor="youtube">Or Audio/Video URL</Label>
                        <div className="relative">
                          <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="youtube"
                            value={newContent.youtube_url}
                            onChange={(e) => setNewContent({ ...newContent, youtube_url: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=... or audio URL"
                            className="pl-10 bg-background border-border"
                          />
                        </div>
                      </div>
                    )}

                    {/* Reading Passage for Reading */}
                    {config.showPassage && (
                      <div className="space-y-2">
                        <Label htmlFor="passage">{config.passageLabel || 'Reading Passage'}</Label>
                        <Textarea
                          id="passage"
                          value={newContent.passage}
                          onChange={(e) => setNewContent({ ...newContent, passage: e.target.value })}
                          placeholder="Enter the reading passage or article text here..."
                          className="bg-background border-border"
                          rows={6}
                        />
                      </div>
                    )}

                    {/* Question Builder for Reading/Listening/Speaking/Writing/Grammar */}
                    {config.showQuestions && (
                      <QuestionBuilder
                        questions={questions}
                        onChange={setQuestions}
                        label={config.questionsLabel || 'Questions'}
                        questionPlaceholder={config.questionPlaceholder}
                        showOptions={config.showOptions !== false}
                        showAudioUrl={config.showListeningModeSelector && listeningMode === 'single'}
                      />
                    )}

                    {/* Video Upload (for video type) */}
                    {newContent.type === 'video' && !config.showAudio && (
                      <>
                        <div className="space-y-2">
                          <Label>Upload Video</Label>
                          <div className="border-2 border-dashed border-border rounded-lg p-4">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="video/mp4,video/webm,video/ogg,video/quicktime"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                            {selectedFile ? (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <File className="w-5 h-5 text-primary" />
                                  <span className="text-sm text-foreground truncate max-w-[200px]">
                                    {selectedFile.name}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setSelectedFile(null)}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div 
                                className="flex flex-col items-center gap-2 cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Upload className="w-8 h-8 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  Click to upload video (MP4, WebM, MOV)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="youtube">Or YouTube URL</Label>
                          <div className="relative">
                            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="youtube"
                              value={newContent.youtube_url}
                              onChange={(e) => setNewContent({ ...newContent, youtube_url: e.target.value })}
                              placeholder="https://www.youtube.com/watch?v=..."
                              className="pl-10 bg-background border-border"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </>
                );
              })()}

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newContent.description}
                  onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                  placeholder="Enter content description"
                  className="bg-background border-border"
                  rows={3}
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={resetAddDialog} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleAddContent} className="bg-primary hover:bg-primary/90" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Create Content'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Content Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Content</DialogTitle>
          </DialogHeader>
          {selectedContent && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={selectedContent.title}
                  onChange={(e) => setSelectedContent({ ...selectedContent, title: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-level">Level</Label>
                  <Select 
                    value={selectedContent.level} 
                    onValueChange={(value) => setSelectedContent({ ...selectedContent, level: value })}
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A1">A1</SelectItem>
                      <SelectItem value="A2">A2</SelectItem>
                      <SelectItem value="B1">B1</SelectItem>
                      <SelectItem value="B2">B2</SelectItem>
                      <SelectItem value="C1">C1</SelectItem>
                      <SelectItem value="C2">C2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    value={selectedContent.status} 
                    onValueChange={(value: 'published' | 'draft') => setSelectedContent({ ...selectedContent, status: value })}
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select 
                  value={selectedContent.category} 
                  onValueChange={(value) => setSelectedContent({ ...selectedContent, category: value })}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grammar">Grammar</SelectItem>
                    <SelectItem value="Vocabulary">Vocabulary</SelectItem>
                    <SelectItem value="Reading">Reading</SelectItem>
                    <SelectItem value="Listening">Listening</SelectItem>
                    <SelectItem value="Writing">Writing</SelectItem>
                    <SelectItem value="Speaking">Speaking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedContent.description || ''}
                  onChange={(e) => setSelectedContent({ ...selectedContent, description: e.target.value })}
                  className="bg-background border-border"
                  rows={3}
                />
              </div>
              {selectedContent.type === 'video' && (
                <div className="space-y-2">
                  <Label htmlFor="edit-youtube">YouTube URL</Label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="edit-youtube"
                      value={selectedContent.youtube_url || ''}
                      onChange={(e) => setSelectedContent({ ...selectedContent, youtube_url: e.target.value })}
                      className="pl-10 bg-background border-border"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditContent} className="bg-primary hover:bg-primary/90">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
