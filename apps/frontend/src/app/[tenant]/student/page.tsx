'use client';

import { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Award, 
  Clock, 
  Loader2, 
  Search,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/axios';

interface Course {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl?: string;
  progress?: {
    percentComplete: number;
    isCompleted: boolean;
  } | null;
  _count: {
     sections: number;
  }
}

export default function StudentDashboard({ params }: { params: { tenant: string } }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get('/courses/my-learning')
      .then(res => {
        setCourses(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar tus cursos.');
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar-less Premium Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="font-black text-2xl text-slate-900 tracking-tighter uppercase">{params.tenant}</h1>
            <nav className="hidden md:flex items-center gap-6">
               <Link href="#" className="text-sm font-bold text-blue-600 border-b-2 border-blue-600 pb-1">Mis Cursos</Link>
               <Link href={`/${params.tenant}/courses`} className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">Explorar Catálogo</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 bg-slate-100 p-1.5 rounded-full pr-4">
             <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-200">S</div>
             <span className="text-xs font-bold text-slate-700">Student Portal</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Mi Aprendizaje</h2>
            <p className="text-slate-500 mt-2 font-medium">Tienes {courses.length} programas activos en {params.tenant}.</p>
          </div>
          
          <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <input 
              type="text" 
              placeholder="Buscar en mis cursos..." 
              className="bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-6 text-sm font-medium w-full md:w-80 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
             />
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
             <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-10 w-10 text-slate-300" />
             </div>
             <h3 className="text-xl font-bold text-slate-900">Aún no tienes cursos inscritos</h3>
             <p className="text-slate-500 mt-2 mb-8">Empieza hoy mismo explorando nuestro catálogo de expertos.</p>
             <Link 
              href={`/${params.tenant}/courses`}
              className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
             >
              Ver Catálogo
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                   {course.thumbnailUrl ? (
                     <img src={course.thumbnailUrl} className="w-full h-full object-cover" alt={course.title} />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                        <Play className="h-12 w-12 text-white/30 fill-white/10" />
                     </div>
                   )}
                   {course.progress?.isCompleted && (
                     <div className="absolute top-4 right-4 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
                        <Award className="h-5 w-5" />
                     </div>
                   )}
                </div>

                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                     <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course._count.sections} Módulos</span>
                     <span>•</span>
                     <span className="flex items-center gap-1 text-blue-600"><CheckCircle className="h-3 w-3" /> Certificación</span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 leading-tight mb-6 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>

                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-bold text-slate-500">{course.progress?.percentComplete || 0}% completado</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                       <div 
                        className={`h-full transition-all duration-1000 ${course.progress?.isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                        style={{ width: `${course.progress?.percentComplete || 0}%` }}
                       ></div>
                    </div>
                  </div>

                  <Link 
                    href={`/${params.tenant}/player/${course.slug}`}
                    className="w-full py-4 rounded-2xl bg-neutral-900 text-white font-bold flex items-center justify-center hover:opacity-90 transition-all active:scale-95 group/btn"
                    style={{ backgroundColor: 'var(--primary-color, #1a1a1a)' }}
                  >
                    {course.progress?.percentComplete && course.progress.percentComplete > 0 ? 'Continuar Aprendiendo' : 'Empezar Curso'}
                    <ChevronRight className="h-5 w-5 ml-2 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
