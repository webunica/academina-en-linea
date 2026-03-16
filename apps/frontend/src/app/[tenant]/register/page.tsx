'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { GraduationCap, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function TenantRegister({ params }: { params: { tenant: string } }) {
  const router = useRouter();
  const loginAction = useAuthStore((state) => state.login);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { firstName: '', lastName: '', email: '', password: '' }
  });

  const onSubmit = async (data: any) => {
    try {
      setErrorMsg('');
      const response = await apiClient.post('/auth/register', data);
      const { accessToken, user } = response.data;
      
      // Auto Login después del registro
      loginAction(user, accessToken);
      
      // Envío al perfil del estudiante recién creado
      router.push(`/${params.tenant}/student`);

    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Error al completar el registro.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Lado Izquierdo (Formulario) */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="flex items-center text-blue-600">
              <GraduationCap className="h-10 w-10 mr-2" />
              <span className="font-bold text-xl tracking-tight text-slate-900 capitalize">{params.tenant} Academy</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-slate-900">Crear una cuenta nueva</h2>
            <p className="mt-2 text-sm text-slate-600">
              O{' '}
              <Link href={`/${params.tenant}/login`} className="font-medium text-blue-600 hover:text-blue-500">
                inicia sesión con tu cuenta existente
              </Link>
            </p>
          </div>

          <div className="mt-8">
            {errorMsg && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{errorMsg}</p>
              </div>
            )}

            <div className="mt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Nombre</label>
                    <div className="mt-1">
                      <input
                        type="text"
                        {...register('firstName', { required: 'Nombre es requerido' })}
                        className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Apellido</label>
                    <div className="mt-1">
                      <input
                        type="text"
                        {...register('lastName', { required: 'Apellido es requerido' })}
                        className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Correo Electrónico</label>
                  <div className="mt-1">
                    <input
                      type="email"
                      {...register('email', { required: 'Email requerido' })}
                      className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Contraseña secreta</label>
                  <div className="mt-1">
                    <input
                      type="password"
                      {...register('password', { required: 'Contraseña requerida', minLength: 6 })}
                      className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                    ) : null}
                    Crear mi cuenta y comenzar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Lado Derecho (Imagen/Cover B2C) */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-800 text-white flex flex-col justify-center px-16">
          <blockquote className="text-3xl font-light italic leading-relaxed">
            "La educación es el pasaporte hacia el futuro, el mañana pertenece a aquellos que se preparan para él en el día de hoy."
          </blockquote>
          <p className="mt-6 text-xl font-medium tracking-wide">— Malcolm X</p>
          <div className="mt-12 flex space-x-3">
            <span className="h-2 w-2 rounded-full bg-white opacity-100"></span>
            <span className="h-2 w-2 rounded-full bg-white opacity-40"></span>
            <span className="h-2 w-2 rounded-full bg-white opacity-40"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
