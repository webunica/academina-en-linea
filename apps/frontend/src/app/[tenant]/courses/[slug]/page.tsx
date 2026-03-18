'use client';

import { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Play, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  ChevronRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface Section {
  id: string;
  title: string;
  lessons?: { id: string }[];
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  thumbnailUrl?: string;
  sections?: Section[];
  _count?: { sections: number };
}

export default function CourseLandingPage({ params }: { params: { tenant: string, slug: string } }) {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get(`/courses/${params.slug}`)
      .then(res => {
        setCourse(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading course:', err);
        setError('No se pudo encontrar el curso o no está disponible.');
        setLoading(false);
      });
  }, [params.slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin h-10 w-10 text-emerald-600" />
    </div>
  );

  if (error || !course) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <BookOpen className="h-16 w-16 text-slate-300 mb-4" />
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Curso no encontrado</h2>
      <p className="text-slate-500 mb-6">{error}</p>
      <button onClick={() => router.back()} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium">
        Volver atrás
      </button>
    </div>
  );

  // Safe derived values — never crash even if structure is missing
  const sectionCount = course.sections?.length ?? course._count?.sections ?? 0;
  const lessonCount = course.sections?.reduce((acc, s) => acc + (s.lessons?.length ?? 0), 0) ?? 0;
  const safePrice = course.price ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header Público Simple */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-8 py-4 flex justify-between items-center shadow-sm">
        <h1 className="font-black text-2xl text-slate-900 tracking-tighter uppercase">{params.tenant}</h1>
        <div className="space-x-4">
          <Link href={`/${params.tenant}/login`} className="text-sm font-bold text-slate-600 hover:text-slate-900">
            Iniciar Sesión
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-slate-900 text-white pt-20 pb-32 px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-slate-800/50 rounded-full px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
              <Award className="h-4 w-4" />
              <span>NUEVO LANZAMIENTO</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              {course.title}
            </h1>
            <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-xl">
              {course.description || 'Domina nuevas habilidades y lleva tu carrera al siguiente nivel con este programa intensivo diseñado por expertos.'}
            </p>
            <div className="flex items-center gap-6 pt-4 text-sm font-bold text-slate-300">
              <span className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-emerald-500" /> {lessonCount} Lecciones
              </span>
              <span className="flex items-center">
                <Play className="h-5 w-5 mr-2 text-emerald-500" /> {sectionCount} Módulos
              </span>
            </div>
          </div>
          
          {/* Tarjeta de Compra Flotante */}
          <div className="w-full md:w-[400px] bg-white rounded-3xl p-6 shadow-2xl text-slate-900 transform md:translate-y-12 border border-slate-100 relative z-10">
            <div className="aspect-video bg-slate-100 rounded-2xl mb-6 overflow-hidden relative group">
              {course.thumbnailUrl ? (
                <img src={course.thumbnailUrl} className="w-full h-full object-cover" alt={course.title} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
                  <Play className="h-16 w-16 text-white/50 group-hover:scale-110 transition-transform cursor-pointer" />
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-black tracking-tight">
                  ${safePrice.toLocaleString('es-CL')}
                </span>
                {safePrice > 0 && (
                  <span className="text-slate-500 font-medium mb-1 line-through">
                    ${Math.round(safePrice * 1.5).toLocaleString('es-CL')}
                  </span>
                )}
              </div>
              <Link 
                href={`/${params.tenant}/checkout/${course.id}`}
                className="w-full bg-emerald-600 text-white font-black py-4 rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
              >
                {safePrice > 0 ? 'Inscribirme Ahora' : 'Inscripción Gratuita'}
              </Link>
              <div className="pt-4 space-y-3">
                <p className="text-sm font-bold text-slate-700">Este curso incluye:</p>
                <ul className="space-y-2 text-sm text-slate-500 font-medium">
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" /> Acceso de por vida</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" /> Certificado de finalización</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" /> Acceso en móviles y TV</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Módulos del Curso */}
      <div className="max-w-5xl mx-auto px-8 py-20 pb-40">
        <div className="md:w-2/3 pr-12">
          <h2 className="text-3xl font-black text-slate-900 mb-8">Lo que aprenderás</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
            {['Dominar los fundamentos clave.', 'Aplicar casos reales.', 'Construir un portafolio.', 'Lograr resultados reales.'].map((item, i) => (
              <div key={i} className="flex items-start">
                <CheckCircle2 className="h-5 w-5 mr-3 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-600 font-medium">{item}</span>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-8">Programa del Curso</h2>
          <div className="space-y-4">
            {course.sections && course.sections.length > 0 ? (
              course.sections.map((section, i) => (
                <div key={section.id} className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
                  <div className="p-5 bg-slate-50 border-b border-slate-200 font-bold text-slate-900 flex justify-between items-center hover:bg-slate-100 transition-colors">
                    <span>Módulo {i + 1}: {section.title}</span>
                    <div className="flex items-center gap-3">
                      {section.lessons && (
                        <span className="text-sm font-normal text-slate-500">{section.lessons.length} lecciones</span>
                      )}
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-slate-200" />
                <p className="font-medium">El contenido del programa estará disponible pronto.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    
      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-8 border-t border-slate-800">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center text-slate-300 mb-4 md:mb-0">
            <ShieldCheck className="h-6 w-6 mr-2 text-emerald-500" />
            <span className="font-bold tracking-widest uppercase text-sm">{params.tenant} Academia</span>
          </div>
          <div className="text-sm font-medium">
            &copy; {new Date().getFullYear()} {params.tenant}. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
