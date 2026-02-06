import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
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
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import { getAuth } from 'firebase/auth';
import { LessonBuilder } from './LessonBuilder';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  level: string;
  category: string;
  status: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  youtubeUrl?: string;
  questions?: string;
  passage?: string;
  createdAt: any;
  updatedAt: any;
  createdBy?: string;
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
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [newContent, setNewContent] = useState({
    title: '',
    type: 'lesson' as 'lesson' | 'quiz' | 'video',
    level: 'A1',
    category: 'Grammar',
    description: '',
    youtubeUrl: '',
    passage: '',
    questions: '',
    status: 'draft' as 'draft' | 'published',
    // Video specific fields
    duration: '',
    tags: [] as string[],
    tagInput: ''
  });

  // Lesson builder state
  const [lessonData, setLessonData] = useState({
    introduction: {
      title: '',
      subtitle: '',
      summary: ''
    },
    sections: [] as any[],
    exercises: [] as any[]
  });

  // Fetch content from Firebase
  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Starting to fetch content...');
      
      // 1. Fetch from adminContent (Quiz type)
      console.log('📊 Querying adminContent collection...');
      const contentRef = collection(db, 'adminContent');
      const contentQuery = query(contentRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(contentQuery);
      
      console.log(`✅ Found ${snapshot.docs.length} items in adminContent`);
      
      const adminContentData: ContentItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ContentItem));
      
      // 2. Fetch from lessonContent
      console.log('📊 Querying lessonContent collection...');
      const lessonsRef = collection(db, 'lessonContent');
      const lessonsSnapshot = await getDocs(lessonsRef);
      
      console.log(`✅ Found ${lessonsSnapshot.docs.length} lessons`);
      
      // Convert lessons to ContentItem format
      const lessonsData: ContentItem[] = lessonsSnapshot.docs.map(doc => {
        const data = doc.data();
        // Capitalize category (moduleId is lowercase in Firebase)
        const category = data.moduleId 
          ? data.moduleId.charAt(0).toUpperCase() + data.moduleId.slice(1)
          : 'General';
        
        return {
          id: doc.id,
          title: data.introduction?.title || 'Untitled Lesson',
          type: 'lesson',
          level: data.level ? data.level.toUpperCase() : 'A1',
          category: category,
          status: 'published', // Lessons don't have status in Firebase, default to published
          description: data.introduction?.summary,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        } as ContentItem;
      });
      
      // 3. Fetch from videos collection
      console.log('📊 Querying videos collection...');
      const videosRef = collection(db, 'videos');
      const videosQuery = query(videosRef, orderBy('uploadedAt', 'desc'));
      const videosSnapshot = await getDocs(videosQuery);
      
      console.log(`✅ Found ${videosSnapshot.docs.length} videos`);
      
      // Convert videos to ContentItem format
      const videosData: ContentItem[] = videosSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Untitled Video',
          type: 'video',
          level: data.level || 'A1',
          category: data.category || 'General',
          status: 'published',
          description: data.description,
          youtubeUrl: data.videoUrl,
          createdAt: data.uploadedAt,
          updatedAt: data.uploadedAt
        } as ContentItem;
      });
      
      // Combine all sources
      const allContent = [...adminContentData, ...lessonsData, ...videosData];
      
      console.log('✅ Total content loaded:', allContent.length);
      console.log('  - Admin Content:', adminContentData.length);
      console.log('  - Lessons:', lessonsData.length);
      console.log('  - Videos:', videosData.length);
      
      setContent(allContent);
    } catch (error) {
      console.error('❌ Error fetching content:', error);
      const errorMessage = (error as Error).message || 'Unknown error';
      setError(errorMessage);
      alert('Failed to load content: ' + errorMessage);
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
      // Validate file type
      if (newContent.type === 'video') {
        const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
        if (!validVideoTypes.includes(file.type)) {
          alert('Please upload a valid video file (MP4, WebM, OGG, MOV)');
          return;
        }
      } else {
        const validDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validDocTypes.includes(file.type)) {
          alert('Please upload a valid document (PDF, DOC, DOCX)');
          return;
        }
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<{ url: string; name: string } | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${newContent.type}s/${fileName}`;
      
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      console.log('✅ File uploaded:', url);
      return { url, name: file.name };
    } catch (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }
  };

  const handleAddContent = async () => {
    if (!newContent.title) {
      alert('Please enter a title');
      return;
    }

    setUploading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      // Handle Lesson type - save to lessonContent collection
      if (newContent.type === 'lesson') {
        // Validation for lesson
        if (!lessonData.introduction.title) {
          alert('Please fill in the Introduction title');
          setUploading(false);
          return;
        }
        if (lessonData.sections.length === 0) {
          alert('Please add at least one section');
          setUploading(false);
          return;
        }
        if (lessonData.exercises.length === 0) {
          alert('Please add at least one exercise');
          setUploading(false);
          return;
        }

        // Generate lesson ID
        const lessonId = `${newContent.category.toLowerCase()}-${Date.now()}`;
        
        const lessonContentData = {
          lessonId,
          moduleId: newContent.category.toLowerCase(),
          level: newContent.level,
          // Note: status is not stored in Firebase for lessons
          introduction: lessonData.introduction,
          sections: lessonData.sections,
          exercises: lessonData.exercises,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: user?.uid || null
        };

        // Save to lessonContent collection
        await setDoc(doc(db, 'lessonContent', lessonId), lessonContentData);

        alert(`✅ Lesson created successfully! ID: ${lessonId}`);
      }
      // Handle Video type - save to videos collection
      else if (newContent.type === 'video') {
        if (!newContent.youtubeUrl) {
          alert('Please provide a video URL');
          setUploading(false);
          return;
        }

        // Extract video ID from YouTube URL
        const videoId = extractYouTubeId(newContent.youtubeUrl);
        if (!videoId) {
          alert('Invalid YouTube URL');
          setUploading(false);
          return;
        }

        const videoData = {
          title: newContent.title,
          description: newContent.description || '',
          category: newContent.category.toLowerCase(),
          level: newContent.level.toLowerCase(),
          videoUrl: `https://www.youtube.com/embed/${videoId}`,
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          duration: newContent.duration || '0:00',
          tags: newContent.tags,
          views: 0,
          likes: 0,
          uploadedAt: serverTimestamp(),
          createdBy: user?.uid || null
        };

        // Save to videos collection
        await addDoc(collection(db, 'videos'), videoData);

        alert(`✅ Video uploaded successfully!`);
      } 
      // Handle Quiz type - save to adminContent collection
      else {
        // Validation based on category
        if (newContent.category === 'Reading' && !newContent.passage.trim()) {
          alert('Please enter the reading passage');
          setUploading(false);
          return;
        }

        if (!newContent.questions.trim()) {
          alert('Please add questions or prompts');
          setUploading(false);
          return;
        }

        let fileData: { url: string; name: string } | null = null;

        if (selectedFile) {
          fileData = await uploadFile(selectedFile);
        }

        const contentData = {
          title: newContent.title,
          type: newContent.type,
          level: newContent.level,
          category: newContent.category,
          description: newContent.description,
          status: newContent.status,
          fileUrl: fileData?.url || null,
          fileName: fileData?.name || null,
          youtubeUrl: newContent.youtubeUrl || null,
          questions: newContent.questions || null,
          passage: newContent.passage || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: user?.uid || null
        };

        await addDoc(collection(db, 'adminContent'), contentData);

        alert(`✅ ${newContent.type.charAt(0).toUpperCase() + newContent.type.slice(1)} created successfully`);
      }

      await fetchContent();
      resetAddDialog();
    } catch (error) {
      console.error('❌ Error adding content:', error);
      alert('Failed to create content: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  // Helper function to extract YouTube video ID
  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /youtube\.com\/watch\?v=([^&]+)/,
      /youtube\.com\/embed\/([^?]+)/,
      /youtu\.be\/([^?]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleEditClick = async (item: ContentItem) => {
    setSelectedContent(item);
    
    // If it's a lesson, fetch full lesson data from lessonContent
    if (item.type === 'lesson') {
      try {
        const lessonDoc = await getDoc(doc(db, 'lessonContent', item.id));
        if (lessonDoc.exists()) {
          const data = lessonDoc.data();
          
          console.log('🔍 Lesson data from Firebase:', data);
          console.log('🔍 Exercises:', data.exercises);
          
          // Add IDs to sections if they don't have them
          const sections = (data.sections || []).map((section: any, index: number) => ({
            ...section,
            id: section.id || `section-${index + 1}`
          }));
          
          // Add IDs to exercises if they don't have them
          const exercises = (data.exercises || []).map((exercise: any, index: number) => ({
            ...exercise,
            id: exercise.id || `exercise-${index + 1}`
          }));
          
          // Populate lesson data
          setLessonData({
            introduction: data.introduction || { title: '', subtitle: '', summary: '' },
            sections: sections,
            exercises: exercises
          });
          // Populate basic info
          const category = data.moduleId 
            ? data.moduleId.charAt(0).toUpperCase() + data.moduleId.slice(1)
            : 'Grammar';
          
          setNewContent({
            ...newContent,
            title: data.introduction?.title || '',
            type: 'lesson',
            level: data.level ? data.level.toUpperCase() : 'A1',
            category: category,
            status: data.status || 'draft'
          });
        }
      } catch (error) {
        console.error('Error fetching lesson data:', error);
        alert('Failed to load lesson data');
        return;
      }
    }
    // If it's a video, fetch full video data
    else if (item.type === 'video') {
      try {
        const videoDoc = await getDoc(doc(db, 'videos', item.id));
        if (videoDoc.exists()) {
          const data = videoDoc.data();
          // Capitalize category and level from Firebase
          const category = data.category 
            ? data.category.charAt(0).toUpperCase() + data.category.slice(1)
            : 'General';
          const level = data.level 
            ? data.level.toUpperCase()
            : 'A1';
          
          setNewContent({
            ...newContent,
            title: data.title || '',
            type: 'video',
            level: level,
            category: category,
            status: 'published',
            description: data.description || '',
            youtubeUrl: data.videoUrl || '',
            duration: data.duration || '',
            tags: data.tags || [],
            tagInput: ''
          });
        }
      } catch (error) {
        console.error('Error fetching video data:', error);
        alert('Failed to load video data');
        return;
      }
    }
    
    setIsEditDialogOpen(true);
  };

  const handleEditContent = async () => {
    if (!selectedContent) return;
    
    setUploading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      // Update Lesson
      if (selectedContent.type === 'lesson') {
        if (!lessonData.introduction.title) {
          alert('Please fill in the Introduction title');
          setUploading(false);
          return;
        }

        const lessonContentData = {
          lessonId: selectedContent.id,
          moduleId: newContent.category.toLowerCase(),
          level: newContent.level,
          // Note: status is not stored in Firebase for lessons
          introduction: lessonData.introduction,
          sections: lessonData.sections,
          exercises: lessonData.exercises,
          updatedAt: serverTimestamp()
        };

        await updateDoc(doc(db, 'lessonContent', selectedContent.id), lessonContentData);
        alert('✅ Lesson updated successfully!');
      }
      // Update Video
      else if (selectedContent.type === 'video') {
        if (!newContent.youtubeUrl) {
          alert('Please provide a video URL');
          setUploading(false);
          return;
        }

        const videoId = extractYouTubeId(newContent.youtubeUrl);
        if (!videoId) {
          alert('Invalid YouTube URL');
          setUploading(false);
          return;
        }

        const videoData = {
          title: newContent.title,
          description: newContent.description || '',
          category: newContent.category.toLowerCase(),
          level: newContent.level.toLowerCase(),
          videoUrl: `https://www.youtube.com/embed/${videoId}`,
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          duration: newContent.duration || '0:00',
          tags: newContent.tags,
          uploadedAt: serverTimestamp()
        };

        await updateDoc(doc(db, 'videos', selectedContent.id), videoData);
        alert('✅ Video updated successfully!');
      }

      await fetchContent();
      setIsEditDialogOpen(false);
      resetEditDialog();
    } catch (error) {
      console.error('❌ Error updating content:', error);
      alert('Failed to update content: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const resetEditDialog = () => {
    setSelectedContent(null);
    setNewContent({ 
      title: '', 
      type: 'lesson', 
      level: 'A1', 
      category: 'Grammar', 
      description: '', 
      youtubeUrl: '', 
      passage: '',
      questions: '',
      status: 'draft',
      duration: '',
      tags: [],
      tagInput: ''
    });
    setLessonData({
      introduction: { title: '', subtitle: '', summary: '' },
      sections: [],
      exercises: []
    });
    setIsEditDialogOpen(false);
  };

  const handleDeleteContent = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this content?');
    if (!confirmed) return;

    try {
      const item = content.find(c => c.id === id);
      
      // Delete file from storage if exists
      if (item?.fileUrl) {
        try {
          const fileRef = ref(storage, item.fileUrl);
          await deleteObject(fileRef);
        } catch (error) {
          console.warn('File not found in storage:', error);
        }
      }

      await deleteDoc(doc(db, 'adminContent', id));
      setContent(content.filter((item) => item.id !== id));
      alert('✅ Content deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting content:', error);
      alert('Failed to delete content');
    }
  };

  // This function is replaced by handleEditClick above

  const resetAddDialog = () => {
    setNewContent({ 
      title: '', 
      type: 'lesson', 
      level: 'A1', 
      category: 'Grammar', 
      description: '', 
      youtubeUrl: '', 
      passage: '',
      questions: '',
      status: 'draft',
      duration: '',
      tags: [],
      tagInput: ''
    });
    setLessonData({
      introduction: {
        title: '',
        subtitle: '',
        summary: ''
      },
      sections: [],
      exercises: []
    });
    setSelectedFile(null);
    setIsAddDialogOpen(false);
  };

  const getAcceptedFileTypes = () => {
    if (newContent.type === 'video') {
      return 'video/mp4,video/webm,video/ogg,video/quicktime';
    }
    return '.pdf,.doc,.docx';
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          <p className="text-destructive">❌ Error: {error}</p>
          <Button onClick={fetchContent}>Retry</Button>
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
                    {item.fileUrl && (
                      <a 
                        href={item.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline text-sm"
                      >
                        <File className="w-3 h-3" />
                        {item.fileName || 'View File'}
                      </a>
                    )}
                    {item.youtubeUrl && (
                      <a 
                        href={item.youtubeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline text-sm"
                      >
                        <Link className="w-3 h-3" />
                        Video Link
                      </a>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(item)}
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
        <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {newContent.type === 'lesson' ? 'Create New Lesson' : 'Upload New Content'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {newContent.type === 'lesson' 
                ? 'Build a structured lesson with introduction, sections, and exercises.' 
                : 'Upload videos or quizzes for your students.'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-140px)] pr-4">
            <div className="space-y-4">
              {/* Basic Info - Always show */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Content Type</Label>
                  <Select 
                    value={newContent.type} 
                    onValueChange={(value: 'lesson' | 'quiz' | 'video') => {
                      setNewContent({ ...newContent, type: value, youtubeUrl: '' });
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
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={newContent.status} onValueChange={(value: 'draft' | 'published') => setNewContent({ ...newContent, status: value })}>
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

              {/* Lesson Type - Show LessonBuilder */}
              {newContent.type === 'lesson' && (
                <LessonBuilder data={lessonData} onChange={setLessonData} />
              )}

              {/* Quiz Type - Show simplified fields */}
              {newContent.type === 'quiz' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Quiz Title</Label>
                    <Input
                      id="title"
                      value={newContent.title}
                      onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                      placeholder="Enter quiz title"
                      className="bg-background border-border"
                    />
                  </div>

                  {newContent.category === 'Reading' && (
                    <div className="space-y-2">
                      <Label htmlFor="passage">Reading Passage</Label>
                      <Textarea
                        id="passage"
                        value={newContent.passage}
                        onChange={(e) => setNewContent({ ...newContent, passage: e.target.value })}
                        placeholder="Enter the reading passage..."
                        className="bg-background border-border"
                        rows={6}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="questions">Questions (JSON format)</Label>
                    <Textarea
                      id="questions"
                      value={newContent.questions}
                      onChange={(e) => setNewContent({ ...newContent, questions: e.target.value })}
                      placeholder='[{"question": "What is...?", "options": ["A", "B", "C", "D"], "answer": 0}]'
                      className="bg-background border-border font-mono text-xs"
                      rows={8}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newContent.description}
                      onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                      placeholder="Enter description"
                      className="bg-background border-border"
                      rows={2}
                    />
                  </div>
                </>
              )}

              {/* Video Type */}
              {newContent.type === 'video' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Video Title</Label>
                    <Input
                      id="title"
                      value={newContent.title}
                      onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                      placeholder="Enter video title"
                      className="bg-background border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube URL</Label>
                    <div className="relative">
                      <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="youtube"
                        value={newContent.youtubeUrl}
                        onChange={(e) => setNewContent({ ...newContent, youtubeUrl: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="pl-10 bg-background border-border"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={newContent.duration}
                      onChange={(e) => setNewContent({ ...newContent, duration: e.target.value })}
                      placeholder="e.g., 19:30"
                      className="bg-background border-border"
                    />
                    <p className="text-xs text-muted-foreground">Format: MM:SS or HH:MM:SS</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        value={newContent.tagInput}
                        onChange={(e) => setNewContent({ ...newContent, tagInput: e.target.value })}
                        placeholder="Enter a tag and press Enter"
                        className="bg-background border-border flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newContent.tagInput.trim()) {
                            e.preventDefault();
                            setNewContent({
                              ...newContent,
                              tags: [...newContent.tags, newContent.tagInput.trim()],
                              tagInput: ''
                            });
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (newContent.tagInput.trim()) {
                            setNewContent({
                              ...newContent,
                              tags: [...newContent.tags, newContent.tagInput.trim()],
                              tagInput: ''
                            });
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    {newContent.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newContent.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="gap-1"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => {
                                setNewContent({
                                  ...newContent,
                                  tags: newContent.tags.filter((_, i) => i !== index)
                                });
                              }}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newContent.description}
                      onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                      placeholder="Enter description"
                      className="bg-background border-border"
                      rows={3}
                    />
                  </div>
                </>
              )}
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
                  Creating...
                </>
              ) : (
                `Create ${newContent.type === 'lesson' ? 'Lesson' : newContent.type === 'quiz' ? 'Quiz' : 'Video'}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Content Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => !open && resetEditDialog()}>
        <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Edit {selectedContent?.type === 'lesson' ? 'Lesson' : 'Video'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedContent?.type === 'lesson' 
                ? 'Update lesson content, sections, and exercises.' 
                : 'Update video details and metadata.'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-140px)] pr-4">
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-level">Level</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
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
              </div>

              {/* Lesson Type - Show LessonBuilder */}
              {selectedContent?.type === 'lesson' && (
                <LessonBuilder data={lessonData} onChange={setLessonData} />
              )}

              {/* Video Type */}
              {selectedContent?.type === 'video' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Video Title</Label>
                    <Input
                      id="edit-title"
                      value={newContent.title}
                      onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                      placeholder="Enter video title"
                      className="bg-background border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-youtube">YouTube URL</Label>
                    <div className="relative">
                      <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="edit-youtube"
                        value={newContent.youtubeUrl}
                        onChange={(e) => setNewContent({ ...newContent, youtubeUrl: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="pl-10 bg-background border-border"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-duration">Duration</Label>
                    <Input
                      id="edit-duration"
                      value={newContent.duration}
                      onChange={(e) => setNewContent({ ...newContent, duration: e.target.value })}
                      placeholder="e.g., 19:30"
                      className="bg-background border-border"
                    />
                    <p className="text-xs text-muted-foreground">Format: MM:SS or HH:MM:SS</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-tags">Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        id="edit-tags"
                        value={newContent.tagInput}
                        onChange={(e) => setNewContent({ ...newContent, tagInput: e.target.value })}
                        placeholder="Enter a tag and press Enter"
                        className="bg-background border-border flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newContent.tagInput.trim()) {
                            e.preventDefault();
                            setNewContent({
                              ...newContent,
                              tags: [...newContent.tags, newContent.tagInput.trim()],
                              tagInput: ''
                            });
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (newContent.tagInput.trim()) {
                            setNewContent({
                              ...newContent,
                              tags: [...newContent.tags, newContent.tagInput.trim()],
                              tagInput: ''
                            });
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    {newContent.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newContent.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="gap-1"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => {
                                setNewContent({
                                  ...newContent,
                                  tags: newContent.tags.filter((_, i) => i !== index)
                                });
                              }}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={newContent.description}
                      onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                      placeholder="Enter description"
                      className="bg-background border-border"
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={resetEditDialog} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleEditContent} className="bg-primary hover:bg-primary/90" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}