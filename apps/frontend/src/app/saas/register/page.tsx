'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { GraduationCap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/axios';
import { useRouter } from 'next/navigation';

export default function CompanyOnboardingRegister() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      companyName: '',
      slug: '',
      adminEmail: '',
      adminPassword: '',
      adminFirstName: '',
      adminLastName: ''
    }
  });

  const slugValue = watch('slug');

  const onSubmit = async (data: any) => {
    try {
      setErrorMsg('');
      const response = await apiClient.post('/tenants', data);
      setIsSuccess(true);
      
      // Esperar 3 segundos para que el usuario lea lo que pasó y redirigir
      setTimeout(() => {
        // Redirigir al login de la nueva academia
        // En producción sería miacademia.academina.cl/login
        window.location.href = `http://${data.slug}.localhost:3000/login`;
      }, 3000);

    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Error al registrar tu academia. Intenta con otro subdominio.');
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border border-emerald-100 text-center animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-100 p-4 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">¡Academia Creada!</h2>
          <p className="text-slate-600 mb-8">
            Estamos configurando tu entorno en <span className="font-bold text-emerald-600">{slugValue}.academina.cl</span>
          </p>
          <div className="flex items-center justify-center text-sm text-slate-400">
            <Loader2 className="animate-spin h-4 w-4 mr-2" />
            Redirigiéndote a tu panel...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row shadow-inner">
      {/* Lado Izquierdo - Branding & Valor */}
      <div className="md:w-1/2 bg-slate-900 p-12 text-white flex flex-col justify-between overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex items-center text-emerald-400 mb-12">
            <GraduationCap className="h-10 w-10 mr-3" />
            <span className="text-2xl font-bold tracking-tight">Academina</span>
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Lanza tu propia escuela online en minutos.
          </h1>
          <ul className="space-y-4 text-slate-400">
            <li className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-3" />
              Multi-tenant aislado y seguro.
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-3" />
              Pagos automáticos vía Webpay y PayPal.
            </li>
            <li className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-3" />
              Hosting de video ultra-seguro incluido.
            </li>
          </ul>
        </div>
        
        {/* Decoración abstracta */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-600 opacity-10 rounded-full blur-3xl"></div>
      </div>

      {/* Lado Derecho - Formulario */}
      <div className="md:w-1/2 p-8 md:p-20 flex items-center justify-center">
        <div className="max-w-md w-full">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Comienza tu prueba</h2>
          <p className="text-slate-500 mb-8">No se requiere tarjeta de crédito para empezar.</p>

          {errorMsg && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-start text-red-700 animate-slide-up">
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{errorMsg}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Detalles de la Academia</label>
              <div className="space-y-4">
                <input 
                  type="text" 
                  {...register('companyName', { required: true })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow placeholder:text-slate-400" 
                  placeholder="Nombre de tu Academia" 
                />
                
                <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-emerald-500 transition-shadow">
                  <input 
                    type="text" 
                    {...register('slug', { required: true, pattern: /^[a-z0-9-]+$/ })}
                    className="flex-1 px-4 py-3 outline-none placeholder:text-slate-400" 
                    placeholder="subdominio" 
                  />
                  <span className="bg-slate-50 px-4 py-3 text-slate-400 border-l border-slate-200 text-sm flex items-center">
                    .academina.cl
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Información del Administrador</label>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input 
                  type="text" 
                  {...register('adminFirstName', { required: true })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow" 
                  placeholder="Nombre" 
                />
                <input 
                  type="text" 
                  {...register('adminLastName', { required: true })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow" 
                  placeholder="Apellido" 
                />
              </div>
              <input 
                type="email" 
                {...register('adminEmail', { required: true })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow mb-4" 
                placeholder="Email corporativo" 
              />
              <input 
                type="password" 
                {...register('adminPassword', { required: true, minLength: 6 })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow" 
                placeholder="Contraseña Maestra" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-3" />
                  Creando academia...
                </>
              ) : (
                'Comenzar mi Academia Gratis'
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4">
              Al registrarte, aceptas nuestros <a href="#" className="underline">Términos de Servicio</a>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
