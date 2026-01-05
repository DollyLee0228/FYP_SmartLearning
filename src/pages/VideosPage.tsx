import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Play, Clock, Eye, ThumbsUp, Search, Filter, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// ✅ Video interface
interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  category: string;
  level: string;
  views: number;
  likes: number;
  uploadedAt?: any;
  tags?: string[];
}

const categoryColors: Record<string, string> = {
  grammar: 'bg-blue-500/20 text-blue-400',
  vocabulary: 'bg-green-500/20 text-green-400',
  pronunciation: 'bg-purple-500/20 text-purple-400',
  conversation: 'bg-orange-500/20 text-orange-400',
  culture: 'bg-pink-500/20 text-pink-400',
};

// ✅ 只用3个级别
const levelColors: Record<string, string> = {
  beginner: 'bg-emerald-500/20 text-emerald-400',
  intermediate: 'bg-sky-500/20 text-sky-400',
  advanced: 'bg-violet-500/20 text-violet-400',
};

export default function VideosPage() {
  const navigate = useNavigate();
  
  // States
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Fetch videos from Firebase
  useEffect(() => {
    async function fetchVideos() {
      try {
        setLoading(true);
        console.log('🎥 Fetching videos from Firebase...');
        
        const videosQuery = query(
          collection(db, 'videos'),
          orderBy('uploadedAt', 'desc')
        );
        
        const snapshot = await getDocs(videosQuery);
        const videosData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Video[];
        
        setVideos(videosData);
        console.log('✅ Videos loaded:', videosData.length);
      } catch (error) {
        console.error('❌ Error fetching videos:', error);
        toast.error('Failed to load videos');
      } finally {
        setLoading(false);
      }
    }
    
    fetchVideos();
  }, []);

  // Filter videos
  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || video.category === categoryFilter;
    const matchesLevel = levelFilter === 'all' || video.level === levelFilter;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  // Loading state
  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-white">
          <DashboardSidebar />
          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading videos...</p>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white">
        <DashboardSidebar />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mb-4 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold mb-2">Video Library</h1>
            <p className="text-muted-foreground">
              Watch educational videos to improve your English skills
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-300 text-black placeholder:text-gray-500"
              />
            </div>
            <div className="flex gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px] bg-card border-border">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="grammar">Grammar</SelectItem>
                  <SelectItem value="vocabulary">Vocabulary</SelectItem>
                  <SelectItem value="pronunciation">Pronunciation</SelectItem>
                  <SelectItem value="conversation">Conversation</SelectItem>
                  <SelectItem value="culture">Culture</SelectItem>
                </SelectContent>
              </Select>
              
              {/* ✅ 只有3个Level选项 */}
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[140px] bg-card border-border">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <Card
                key={video.id}
                className="bg-card border-border overflow-hidden cursor-pointer group hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                      <Play className="w-6 h-6 text-primary-foreground ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-xs text-white flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {video.duration}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex gap-2 mb-2">
                    {/* ✅ Level badge - 首字母大写 */}
                    <Badge className={levelColors[video.level] || levelColors.beginner}>
                      {video.level.charAt(0).toUpperCase() + video.level.slice(1)}
                    </Badge>
                    <Badge className={categoryColors[video.category] || categoryColors.grammar}>
                      {video.category.charAt(0).toUpperCase() + video.category.slice(1)}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {video.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatViews(video.views || 0)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {formatViews(video.likes || 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredVideos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No videos found matching your criteria.</p>
            </div>
          )}

          {/* Video Player Dialog */}
          <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
            <DialogContent className="max-w-4xl bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">{selectedVideo?.title}</DialogTitle>
              </DialogHeader>
              <div className="aspect-video w-full">
                <iframe
                  src={selectedVideo?.videoUrl}
                  title={selectedVideo?.title}
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="mt-4">
                <div className="flex gap-2 mb-3">
                  {selectedVideo && (
                    <>
                      <Badge className={levelColors[selectedVideo.level] || levelColors.beginner}>
                        {selectedVideo.level.charAt(0).toUpperCase() + selectedVideo.level.slice(1)}
                      </Badge>
                      <Badge className={categoryColors[selectedVideo.category] || categoryColors.grammar}>
                        {selectedVideo.category.charAt(0).toUpperCase() + selectedVideo.category.slice(1)}
                      </Badge>
                    </>
                  )}
                </div>
                <p className="text-muted-foreground">{selectedVideo?.description}</p>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  );
}