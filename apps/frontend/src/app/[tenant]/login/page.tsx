'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function TenantLogin({ params }: { params: { tenant: string } }) {
  const router = useRouter();
  const loginAction = useAuthStore((state) => state.login);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data: any) => {
    try {
      setErrorMsg('');
      const response = await apiClient.post('/auth/login', data);
      
      const { accessToken, user } = response.data;
      
      // Guardar Globalmente
      loginAction(user, accessToken);
      
      // Redirigir basado en el Rol detectado
      if (user.role === 'TENANT_ADMIN' || user.role === 'INSTRUCTOR') {
        router.push(`/${params.tenant}/admin`);
      } else {
        router.push(`/${params.tenant}/student`);
      }

    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Credenciales inválidas. Por favor intente nuevamente.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-blue-600">
          <BookOpen className="h-12 w-12" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Ingreso a la Academia
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          ¿No tienes una cuenta aún?{' '}
          <Link href={`/${params.tenant}/register`} className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
            Regístrate aquí
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-100 relative overflow-hidden">
          
          {/* Adorno Minimalista */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

          {errorMsg && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Correo Electrónico
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  {...register('email', { required: 'El correo es obligatorio' })}
                  autoComplete="email"
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
                  placeholder="ejemplo@correo.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  {...register('password', { required: 'La contraseña es obligatoria' })}
                  autoComplete="current-password"
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                  Recordarme
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                ) : null}
                Iniciar Sesión
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
