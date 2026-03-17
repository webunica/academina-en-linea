'use client';

import { useEffect, useState } from 'react';
import { 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  PlayCircle, 
  FileText,
  MessageSquare,
  Settings,
  MoreVertical,
  Loader2
} from 'lucide-react';
import { apiClient } from '@/lib/axios';

interface Lesson {
  id: string;
  title: string;
  type: string;
  videoAssetId?: string;
  videoAsset?: {
    providerId: string;
  }
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  sections: Section[];
}

export default function CoursePlayerPage({ params }: { params: { tenant: string, courseSlug: string } }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    apiClient.get(`/courses/${params.courseSlug}`)
      .then(res => {
        setCourse(res.data);
        if (res.data.sections?.[0]?.lessons?.[0]) {
          setActiveLesson(res.data.sections[0].lessons[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.courseSlug]);

  useEffect(() => {
    if (activeLesson?.videoAsset?.providerId) {
      setLoadingVideo(true);
      apiClient.get(`/media/signed-url/${activeLesson.videoAsset.providerId}`)
        .then(res => {
          setVideoUrl(res.data.url);
        })
        .catch(() => setVideoUrl(null))
        .finally(() => setLoadingVideo(false));
    } else {
      setVideoUrl(null);
    }
  }, [activeLesson]);

  const handleComplete = async () => {
    if (!activeLesson) return;
    try {
      await apiClient.post(`/enrollments/lessons/${activeLesson.id}/complete`);
      
      const allLessons = course?.sections.flatMap(s => s.lessons) || [];
      const currentIndex = allLessons.findIndex(l => l.id === activeLesson.id);
      
      if (currentIndex < allLessons.length - 1) {
        setActiveLesson(allLessons[currentIndex + 1]);
      } else {
        alert("¡Felicidades! Has completado el curso.");
      }
    } catch (e) {
      console.error("Error al completar lección:", e);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-900">
      <Loader2 className="animate-spin h-10 w-10 text-emerald-500" />
    </div>
  );

  return (
    <div className="h-screen bg-slate-900 flex flex-col md:flex-row overflow-hidden text-slate-200">
      
      {/* Sidebar - Curriculum */}
      <aside className={`bg-slate-800 border-r border-slate-700 flex-shrink-0 transition-all duration-300 ${sidebarOpen ? 'w-full md:w-80' : 'w-0'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-700">
          <span className="font-bold truncate">Contenido del Curso</span>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <ChevronLeft />
          </button>
        </div>
        
        <div className="overflow-y-auto h-[calc(100vh-64px)] custom-scrollbar">
          {course?.sections.map((section, sIndex) => (
            <div key={section.id} className="border-b border-slate-700/50">
              <div className="px-6 py-4 bg-slate-800/50 flex items-center justify-between group">
                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{section.title}</h4>
                 <span className="text-[10px] text-slate-600 font-bold">{section.lessons.length} Lecciones</span>
              </div>
              <div>
                {section.lessons.map((lesson) => (
                  <button 
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full flex items-center px-6 py-4 text-left hover:bg-slate-700 transition-colors gap-3 ${activeLesson?.id === lesson.id ? 'bg-emerald-900/40 border-l-4 border-emerald-500 text-white' : ''}`}
                  >
                    {lesson.type === 'VIDEO' ? <PlayCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    <span className="text-sm font-medium line-clamp-1">{lesson.title}</span>
                    <CheckCircle className="h-4 w-4 ml-auto text-slate-600 opacity-20" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Player Area */}
      <main className="flex-1 flex flex-col bg-black">
        {/* Player Header */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6">
           <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-slate-800 rounded-lg">
                  <Menu className="h-5 w-5" />
                </button>
              )}
              <h2 className="text-sm font-bold truncate">{activeLesson?.title || 'Seleccionar Lección'}</h2>
           </div>
           <div className="flex items-center gap-4">
              <button className="flex items-center text-xs font-bold bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                 <MessageSquare className="h-4 w-4 mr-2" /> Comunidad
              </button>
              <button className="p-2 hover:bg-slate-800 rounded-lg">
                 <Settings className="h-5 w-5 text-slate-500" />
              </button>
           </div>
        </header>

        {/* Video Frame */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
           <div className="w-full max-w-5xl aspect-video bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden relative group">
              {videoUrl ? (
                <iframe 
                  src={videoUrl} 
                  loading="lazy" 
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" 
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-4">
                   {loadingVideo ? (
                     <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                   ) : (
                     <>
                      <div className="bg-slate-800 p-8 rounded-full">
                        <PlayCircle className="h-16 w-16 opacity-20" />
                      </div>
                      <p className="font-bold text-sm uppercase tracking-widest">Esta lección no tiene video aún</p>
                     </>
                   )}
                </div>
              )}
           </div>
        </div>

        {/* Lesson Navigation */}
        <footer className="bg-slate-900 border-t border-slate-800 px-8 py-6 flex items-center justify-between">
           <button className="flex items-center text-sm font-bold text-slate-400 hover:text-white transition-colors">
              <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
           </button>
           <button 
             onClick={handleComplete}
             className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 active:scale-95 flex items-center"
           >
              Completar y Siguiente <ChevronRight className="h-4 w-4 ml-2" />
           </button>
        </footer>
      </main>
    </div>
  );
}
