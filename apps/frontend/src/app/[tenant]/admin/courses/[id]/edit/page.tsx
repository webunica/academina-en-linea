'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus, 
  GripVertical, 
  Video, 
  FileText, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Save,
  Loader2,
  BookOpen,
  Layout
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/axios';
import VideoUploader from '@/components/media/VideoUploader';

interface Lesson {
  id: string;
  title: string;
  type: string;
  order: number;
  bunnyVideoId?: string; // Relation derived from mediaAsset
}

interface Section {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  sections: Section[];
}

export default function CourseCurriculumEditor({ params }: { params: { tenant: string, id: string } }) {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);

  useEffect(() => {
    fetchCourse();
  }, [params.id]);

  const fetchCourse = async () => {
    try {
      const response = await apiClient.get(`/courses/${params.id}`); // Necesitamos un endpoint por ID también o usar slug
      // Como el controller anterior usa slug, vamos a buscarlo por slug o ID si existe el endpoint
      // Ajustemos el backend para aceptar ID en el controller.
      setCourse(response.data);
    } catch (err) {
      console.error('Error fetching course:', err);
      // Fallback: tratar de buscar por ID si el slug falla (si es uuid el param)
      apiClient.get(`/courses/detail/${params.id}`).then(res => setCourse(res.data)).catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) return;
    try {
      setSaving(true);
      await apiClient.post(`/courses/${params.id}/sections`, { title: newSectionTitle });
      setNewSectionTitle('');
      setIsAddingSection(false);
      fetchCourse();
    } catch (err) {
      console.error('Error adding section:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddLesson = async (sectionId: string) => {
    const title = window.prompt('Título de la lección:');
    if (!title) return;
    try {
      setSaving(true);
      await apiClient.post(`/courses/sections/${sectionId}/lessons`, { 
        title, 
        type: 'VIDEO' 
      });
      fetchCourse();
    } catch (err) {
      console.error('Error adding lesson:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin h-10 w-10 text-emerald-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Dynamic Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href={`/${params.tenant}/admin/courses`} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Currículum</span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{course?.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase">Cambios Guardados</span>
          <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center hover:bg-slate-800 transition-all active:scale-95 shadow-md">
            <Layout className="h-4 w-4 mr-2" />
            Vista Previa
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
             <BookOpen className="h-6 w-6 mr-3 text-emerald-600" />
             Contenido del Programa
           </h2>
           <button 
             onClick={() => setIsAddingSection(true)}
             disabled={isSubmitting}
             className="text-emerald-600 font-bold hover:underline flex items-center text-sm"
           >
             <Plus className="h-4 w-4 mr-1" />
             Añadir Módulo
           </button>
        </div>

        {/* Sections List */}
        <div className="space-y-6">
          {course?.sections.map((section, sIndex) => (
            <div key={section.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
              {/* Section Header */}
              <div className="bg-slate-50/50 px-6 py-4 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="h-10 w-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center font-bold text-slate-400 text-sm">
                    {sIndex + 1}
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">{section.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                   <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                     <Edit3 className="h-4 w-4" />
                   </button>
                   <button className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                     <Trash2 className="h-4 w-4" />
                   </button>
                </div>
              </div>

              {/* Lessons inside Section */}
              <div className="p-2 divide-y divide-slate-100">
                {section.lessons.map((lesson, lIndex) => (
                  <div key={lesson.id} className="transition-all">
                    <div 
                      onClick={() => setExpandedLessonId(expandedLessonId === lesson.id ? null : lesson.id)}
                      className={`flex items-center justify-between px-4 py-4 hover:bg-slate-50 transition-colors rounded-xl cursor-pointer ${expandedLessonId === lesson.id ? 'bg-slate-50' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                         <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                           <Video className={`h-4 w-4 ${lesson.bunnyVideoId ? 'text-emerald-500' : 'text-slate-300'}`} />
                         </div>
                         <span className="text-sm font-bold text-slate-700">
                          {lIndex + 1}. {lesson.title}
                         </span>
                      </div>
                      <div className="flex items-center text-xs text-slate-400 gap-4">
                         {lesson.bunnyVideoId ? (
                           <span className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase tracking-tighter">HD</span>
                         ) : (
                           <span className="italic">Sin video</span>
                         )}
                         <ChevronDown className={`h-4 w-4 transition-transform ${expandedLessonId === lesson.id ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {/* Expanded Lesson Content (Uploader) */}
                    {expandedLessonId === lesson.id && (
                      <div className="px-6 py-8 bg-slate-50/30 border-y border-slate-100 animate-slide-down">
                         <div className="max-w-2xl mx-auto">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Ingesta de Video (Bunny.net)</label>
                            <VideoUploader 
                              currentVideoId={lesson.bunnyVideoId}
                              onUploadComplete={async (bunnyVideoId) => {
                                // Guardar el ID en la lección (Backend update)
                                try {
                                  await apiClient.patch(`/courses/lessons/${lesson.id}`, { bunnyVideoId });
                                  fetchCourse();
                                } catch (e) {
                                  console.error("Error linking video:", e);
                                }
                              }}
                            />
                         </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add Lesson Button */}
                <button 
                  onClick={() => handleAddLesson(section.id)}
                  className="w-full py-4 text-sm font-semibold text-slate-400 hover:text-emerald-600 transition-colors flex items-center justify-center gap-1 group/btn"
                >
                  <Plus className="h-4 w-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  Añadir lección
                </button>
              </div>
            </div>
          ))}

          {/* Inline Add Section */}
          {isAddingSection ? (
            <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-xl p-6 ring-4 ring-emerald-50 animate-pop-in">
              <input 
                 autoFocus
                 type="text" 
                 value={newSectionTitle}
                 onChange={(e) => setNewSectionTitle(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
                 placeholder="Ej: Introducción al Mercado de Capitales"
                 className="w-full text-xl font-bold text-slate-900 bg-transparent outline-none mb-4"
              />
              <div className="flex justify-end gap-3">
                 <button 
                   onClick={() => setIsAddingSection(false)}
                   className="px-4 py-2 text-slate-500 font-bold text-sm"
                 >
                   Cancelar
                 </button>
                 <button 
                   onClick={handleAddSection}
                   disabled={saving}
                   className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold text-sm flex items-center"
                 >
                   {saving && <Loader2 className="animate-spin h-3 w-3 mr-2" />}
                   Crear Sección
                 </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsAddingSection(true)}
              className="w-full py-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/30 transition-all group"
            >
              <Plus className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-bold">Añadir Módulo / Sección</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Icono auxiliar local
function Edit3(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit-3"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
  );
}

function MoreVertical(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-vertical"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
  );
}
