import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export default function LessonPage() {
  const { moduleId, lessonId } = useParams();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    async function fetchData() {
      if (!lessonId) {
        toast.error('Lesson ID is missing');
        navigate(-1);
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Fetching lesson:', lessonId);

        // Fetch lesson metadata
        const lessonRef = doc(db, 'lessons', lessonId);
        const lessonSnap = await getDoc(lessonRef);
        
        if (!lessonSnap.exists()) {
          console.error('❌ Lesson not found');
          toast.error('Lesson not found');
          navigate(-1);
          return;
        }

        const lessonData = { id: lessonSnap.id, ...lessonSnap.data() };
        setLesson(lessonData);
        console.log('✅ Lesson loaded:', lessonData);

        // Fetch lesson content
        const contentRef = doc(db, 'lessonContent', lessonId);
        const contentSnap = await getDoc(contentRef);
        
        if (contentSnap.exists()) {
          const contentData = contentSnap.data();
          setContent(contentData);
          console.log('✅ Content loaded:', contentData);
        } else {
          console.warn('⚠️ No content found for this lesson');
          toast.warning('Lesson content not available yet');
        }

      } catch (error: any) {
        console.error('❌ Error loading lesson:', error);
        toast.error('Failed to load lesson');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [lessonId, navigate]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading lesson...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!lesson || !content) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-xl mb-4">Lesson not found</h2>
          <Button onClick={() => navigate(-1)} className="bg-cyan-500">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const totalSections = content?.sections?.length || 0;
  const section = content?.sections?.[currentSection];
  const progress = totalSections > 0 ? Math.round(((currentSection + 1) / totalSections) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Header with Exit and Progress */}
      <div className="bg-[#0f1420] border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(`/modules/${moduleId}`)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Exit Lesson</span>
            </button>
            <span className="text-gray-400">{lesson.duration}</span>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-lg font-semibold">{lesson.title}</h1>
              <span className="text-cyan-400 font-semibold">{progress}%</span>
            </div>
            <Progress 
              value={progress} 
              className="h-2 bg-gray-800"
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto px-6 py-8 pb-32">
        {section ? (
          <div className="bg-[#0f1929] rounded-2xl p-8 min-h-[500px]">
            {/* Section Content with Custom Styling */}
            <div className="prose-lesson">
              <style>{`
                .prose-lesson {
                  color: rgb(209, 213, 219);
                  line-height: 1.75;
                }
                
                .prose-lesson h1 {
                  color: white;
                  font-size: 1.5rem;
                  font-weight: 600;
                  margin-bottom: 1.5rem;
                }
                
                .prose-lesson h2 {
                  color: rgb(34, 211, 238);
                  font-size: 1.25rem;
                  font-weight: 600;
                  margin-top: 1.5rem;
                  margin-bottom: 1rem;
                }
                
                .prose-lesson h3 {
                  color: rgb(34, 211, 238);
                  font-size: 1.125rem;
                  font-weight: 600;
                  margin-top: 1.25rem;
                  margin-bottom: 0.75rem;
                }
                
                .prose-lesson p {
                  color: rgb(209, 213, 219);
                  margin-bottom: 1rem;
                }
                
                .prose-lesson strong {
                  color: rgb(34, 211, 238);
                  font-weight: 600;
                }
                
                .prose-lesson ul,
                .prose-lesson ol {
                  margin-left: 1.5rem;
                  margin-bottom: 1rem;
                }
                
                .prose-lesson li {
                  color: rgb(209, 213, 219);
                  margin-bottom: 0.5rem;
                  line-height: 1.75;
                }
                
                .prose-lesson code {
                  color: rgb(34, 211, 238);
                  background-color: rgba(34, 211, 238, 0.1);
                  padding: 0.125rem 0.375rem;
                  border-radius: 0.25rem;
                  font-size: 0.875em;
                }
              `}</style>
              
              <ReactMarkdown>{section.content}</ReactMarkdown>
            </div>

            {/* Tables */}
            {section.tables && section.tables.length > 0 && (
              <div className="mt-6 space-y-6">
                {section.tables.map((table: any, idx: number) => (
                  <div key={idx}>
                    <h3 className="text-cyan-400 font-semibold mb-3">{table.title}</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-700">
                            {table.columns?.map((col: any) => (
                              <th 
                                key={col.key} 
                                className="px-4 py-3 text-left text-sm font-semibold text-gray-400"
                              >
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {table.rows?.map((row: any, rowIdx: number) => (
                            <tr 
                              key={rowIdx} 
                              className="border-b border-gray-800"
                            >
                              {table.columns?.map((col: any) => (
                                <td 
                                  key={col.key} 
                                  className="px-4 py-3 text-gray-300"
                                >
                                  {row[col.key]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Examples */}
            {section.examples && section.examples.length > 0 && (
              <div className="mt-6">
                <h3 className="text-cyan-400 font-semibold mb-4">Examples:</h3>
                <div className="space-y-3">
                  {section.examples.map((example: any, idx: number) => (
                    <div key={idx}>
                      {example.sentences?.map((sent: any, sIdx: number) => (
                        <div key={sIdx} className="mb-2">
                          <p className="text-gray-200">
                            • {sent.english}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vocabulary */}
            {section.vocabulary && section.vocabulary.length > 0 && (
              <div className="mt-6">
                <h3 className="text-cyan-400 font-semibold mb-4">Vocabulary:</h3>
                <div className="space-y-3">
                  {section.vocabulary.map((vocab: any, idx: number) => (
                    <div key={idx} className="bg-[#0a0f1a] p-4 rounded-lg">
                      <div className="font-semibold text-cyan-400 mb-1">{vocab.word}</div>
                      <div className="text-sm text-gray-400 mb-2">{vocab.definition}</div>
                      {vocab.example && (
                        <div className="text-sm text-gray-300 italic">
                          "{vocab.example}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#0f1929] rounded-2xl p-8 text-center">
            <p className="text-gray-400">No content available</p>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0f1a] border-t border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
            disabled={currentSection === 0}
            variant="ghost"
            className="text-gray-400 disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentSection < totalSections - 1 ? (
            <Button
              onClick={() => setCurrentSection(prev => prev + 1)}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-8"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (content?.exercises && content.exercises.length > 0) {
                  toast.success('Lesson completed! Starting exercises...');
                  // TODO: Navigate to exercises
                } else {
                  toast.success('Lesson completed!');
                  navigate(`/modules/${moduleId}`);
                }
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-8"
            >
              Complete
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}