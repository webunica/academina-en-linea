'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Settings, 
  CreditCard,
  LogOut,
  TrendingUp,
  Activity,
  DollarSign
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/axios';

// Interfaces de Tipo para Analytics
interface DashboardMetrics {
  activeStudents: number;
  publishedCourses: number;
  grossSales: number;
  latestTransaction: {
    amount: number;
    currency: string;
    gateway: string;
    createdAt: string;
  } | null;
}

export default function AcademyAdminDashboard({ params }: { params: { tenant: string } }) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Protección estricta de rutas (Front-end Auth Guard)
    if (!isAuthenticated) {
      router.push(`/${params.tenant}/login`);
      return;
    }

    if (user?.role !== 'TENANT_ADMIN' && user?.role !== 'INSTRUCTOR') {
      router.push(`/${params.tenant}/student`);
      return;
    }

    // Cargar la Inteligencia de Datos desde NestJS Fase 6
    const fetchAnalytics = async () => {
      try {
        const response = await apiClient.get('/analytics/dashboard');
        setMetrics(response.data);
      } catch (error) {
        console.error('Error fetching tenant metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [isAuthenticated, user, router, params.tenant]);

  const handleLogout = () => {
    logout();
    router.push(`/${params.tenant}/login`);
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Activity className="animate-spin text-blue-600 h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar B2B Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="text-white font-bold text-lg truncate capitalize">{params.tenant} Admin</span>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1">
          <Link href={`/${params.tenant}/admin`} className="bg-slate-800 text-white flex items-center px-3 py-2.5 rounded-md font-medium">
            <LayoutDashboard className="h-5 w-5 mr-3 text-blue-500" /> Dashboard
          </Link>
          <Link href={`/${params.tenant}/admin/courses`} className="text-slate-300 hover:bg-slate-800 hover:text-white flex items-center px-3 py-2.5 rounded-md font-medium transition-colors">
            <BookOpen className="h-5 w-5 mr-3 text-slate-400" /> Cursos
          </Link>
          <Link href={`/${params.tenant}/admin/students`} className="text-slate-300 hover:bg-slate-800 hover:text-white flex items-center px-3 py-2.5 rounded-md font-medium transition-colors">
             <Users className="h-5 w-5 mr-3 text-slate-400" /> Alumnos
          </Link>
          <Link href={`/${params.tenant}/admin/finance`} className="text-slate-300 hover:bg-slate-800 hover:text-white flex items-center px-3 py-2.5 rounded-md font-medium transition-colors">
            <CreditCard className="h-5 w-5 mr-3 text-slate-400" /> Finanzas
          </Link>
          <Link href={`/${params.tenant}/admin/settings`} className="text-slate-300 hover:bg-slate-800 hover:text-white flex items-center px-3 py-2.5 rounded-md font-medium transition-colors">
            <Settings className="h-5 w-5 mr-3 text-slate-400" /> Ajustes
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-800">Resumen Analítico</h1>
          <div className="flex items-center space-x-4">
             <span className="text-sm text-slate-500">Bienvenido, <span className="font-semibold text-slate-700">{user?.email}</span></span>
             <div className="h-8 w-8 rounded-full bg-blue-100 flex justify-center items-center text-blue-700 font-bold">
               {user?.email.charAt(0).toUpperCase()}
             </div>
          </div>
        </header>

        {/* Dashboard Widgets */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Metric 1 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Ventas Brutas</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  ${(metrics?.grossSales || 0).toLocaleString('es-CL')}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Alumnos Activos</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{metrics?.activeStudents || 0}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Cursos Publicados</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{metrics?.publishedCourses || 0}</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg">
                <BookOpen className="h-6 w-6 text-indigo-600" />
              </div>
            </div>

          </div>

          {/* Recents Table (Placeholder for UI WOW Factor) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-base font-semibold text-slate-800">Actividad Reciente</h3>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50">
                Exportar CSV
              </button>
            </div>
            <div className="p-6">
              {metrics?.latestTransaction ? (
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-white rounded-full shadow-sm">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Nueva Venta ({metrics.latestTransaction.gateway})</p>
                      <p className="text-xs text-slate-500">{new Date(metrics.latestTransaction.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-slate-900">
                    ${metrics.latestTransaction.amount.toLocaleString('es-CL')} {metrics.latestTransaction.currency}
                  </span>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Activity className="h-8 w-8 mx-auto mb-3 text-slate-300" />
                  <p>Aún no hay transacciones en esta academia.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
