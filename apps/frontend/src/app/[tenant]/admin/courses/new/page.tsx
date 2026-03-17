'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  BookText, 
  DollarSign, 
  Tag, 
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/axios';

export default function NewCoursePage({ params }: { params: { tenant: string } }) {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      price: 0,
      level: 'ALL_LEVELS',
      status: 'DRAFT'
    }
  });

  const titleValue = watch('title');

  // Auto-generar slug simple cuando el título cambia
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setValue('title', title);
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setValue('slug', slug);
  };

  const onSubmit = async (data: any) => {
    try {
      setErrorMsg('');
      const response = await apiClient.post('/courses', {
        ...data,
        price: parseInt(data.price, 10)
      });
      // Navegar al editor de currículum
      router.push(`/${params.tenant}/admin/courses/${response.data.id}/edit`);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al crear el curso. Revisa el slug.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${params.tenant}/admin/courses`} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="h-10 w-px bg-slate-100 mx-2"></div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Crear Contenido</span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Nuevo Programa</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/${params.tenant}/admin/courses`} className="px-5 py-2 text-slate-600 font-semibold hover:text-slate-900">
            Descartar
          </Link>
          <button 
            type="submit" 
            form="course-form"
            disabled={isSubmitting}
            className="bg-slate-900 text-white px-8 py-2.5 rounded-xl font-bold flex items-center hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 shadow-md"
          >
            {isSubmitting ? 'Creando...' : 'Crear y Continuar'}
            <ChevronRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-12 px-6">
        {errorMsg && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-center text-red-700 animate-slide-up">
            <Info className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        <form id="course-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Main Info */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10">
            <h2 className="text-lg font-bold text-slate-900 flex items-center mb-1">
              <BookText className="h-5 w-5 mr-3 text-emerald-600" />
              Información del Curso
            </h2>
            <p className="text-sm text-slate-500 mb-8 pb-8 border-b border-slate-50">
              Define la identidad de tu curso. El slug será la URL permanente.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Título del Curso</label>
                <input 
                  type="text" 
                  {...register('title', { required: true })}
                  onChange={handleTitleChange}
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all text-lg font-semibold placeholder:text-slate-300"
                  placeholder="Ej: Máster en Finanzas Personales"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Subdominio / Slug de URL</label>
                  <div className="flex bg-slate-50 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                    <span className="px-4 py-4 text-slate-400 bg-slate-100 font-mono text-sm flex items-center">
                      /cursos/
                    </span>
                    <input 
                      type="text" 
                      {...register('slug', { required: true })}
                      className="flex-1 px-4 py-4 bg-transparent outline-none font-mono text-sm"
                      placeholder="master-finanzas"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Precio de Lanzamiento (CLP)</label>
                  <div className="flex bg-slate-50 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                    <span className="px-4 py-4 text-slate-400 font-bold bg-slate-100 flex items-center">
                      $
                    </span>
                    <input 
                      type="number" 
                      {...register('price', { required: true })}
                      className="flex-1 px-4 py-4 bg-transparent outline-none text-lg font-bold"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Additional Details */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8 transform translate-x-8 -translate-y-8 opacity-5">
               <Sparkles className="h-40 w-40 text-emerald-900" />
             </div>

             <div className="relative z-10">
                <h2 className="text-lg font-bold text-slate-900 flex items-center mb-8">
                  <Tag className="h-5 w-5 mr-3 text-emerald-600" />
                  Meta-datos & Nivel
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nivel del Estudiante</label>
                    <select 
                      {...register('level')}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="ALL_LEVELS">Todos los niveles</option>
                      <option value="BEGINNER">Principiante</option>
                      <option value="INTERMEDIATE">Intermedio</option>
                      <option value="ADVANCED">Avanzado</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Estado Inicial</label>
                    <select 
                      {...register('status')}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="DRAFT">Borrador (Solo visible para ti)</option>
                      <option value="PUBLISHED">Publicado (Visible en tienda)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Descripción General (Subtítulo)</label>
                  <textarea 
                    {...register('description')}
                    rows={4}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                    placeholder="Describe en una frase de qué trata el curso..."
                  />
                </div>
             </div>
          </section>
        </form>
      </div>
    </div>
  );
}
