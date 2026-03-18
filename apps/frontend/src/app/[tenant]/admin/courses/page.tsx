'use client';

import { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit3, 
  ExternalLink, 
  BookOpen, 
  Clock,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/axios';

interface Course {
  id: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  price: number;
  _count: {
    sections: number;
    enrollments: number;
  }
}

export default function CoursesListPage({ params }: { params: { tenant: string } }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await apiClient.get('/courses');
        setCourses(response.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Cursos</h1>
          <p className="text-slate-500 mt-1">Gestiona el catálogo de formación de tu academia.</p>
        </div>
        
        <Link 
          href={`/${params.tenant}/admin/courses/new`}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-[0.98] w-fit"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Curso
        </Link>
      </div>

      {/* Toolbox */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por título o categoría..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:bg-slate-200'}`}
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:bg-slate-200'}`}
          >
            <ListIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-slate-100 h-64 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {courses.map(course => (
            <div 
              key={course.id} 
              className={`bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group ${viewMode === 'list' ? 'flex items-center p-4 gap-6' : ''}`}
            >
              {/* Thumbnail Placeholder */}
              <div className={viewMode === 'grid' 
                ? "h-40 bg-slate-100 relative" 
                : "h-20 w-32 bg-slate-100 rounded-lg flex-shrink-0"
              }>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-slate-300" />
                </div>
                {course.status === 'DRAFT' && (
                  <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded backdrop-blur-md">
                    Borrador
                  </span>
                )}
              </div>

              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                    {course.title}
                  </h3>
                  <button className="p-1 text-slate-400 hover:text-slate-600">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center text-xs text-slate-500 gap-4 mb-4">
                  <span className="flex items-center"><ListIcon className="h-3 w-3 mr-1" /> {course._count.sections} Secciones</span>
                  <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> 12h contenido</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <span className="font-bold text-slate-900 text-lg">
                    ${course.price.toLocaleString('es-CL')}
                  </span>
                  <div className="flex gap-2">
                    <Link 
                      href={`/${params.tenant}/admin/courses/${course.id}/edit`}
                      className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    >
                      <Edit3 className="h-5 w-5" />
                    </Link>
                    <a 
                      href={`/${params.tenant}/courses/${course.slug}`} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-20 text-center">
          <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-10 w-10 text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Aún no tienes cursos</h2>
          <p className="text-slate-500 mb-8 max-w-xs mx-auto">Comienza a crear tu catálogo digital y empieza a vender conocimiento hoy mismo.</p>
          <Link 
            href={`/${params.tenant}/admin/courses/new`}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 inline-block"
          >
            Crear mi primer curso
          </Link>
        </div>
      )}
    </div>
  );
}
