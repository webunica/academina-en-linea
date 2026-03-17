'use client';

import { CheckCircle2, Play, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CheckoutSuccessPage({ params }: { params: { tenant: string } }) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simular pequeña espera para asegurar que el webhook bancario llegó
    // En un caso real, aquí polling al backend para confirmar estado de la orden
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
     return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
         <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
         <p className="font-bold text-slate-900">Validando Transacción Bancaria...</p>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 p-10 text-center animate-fade-in">
        <div className="bg-emerald-100 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner shadow-emerald-200/50">
           <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">¡Pago Exitoso!</h1>
        <p className="text-slate-500 mb-10 leading-relaxed font-medium">
          Tu acceso al programa ha sido activado. Puedes comenzar a aprender de inmediato.
        </p>

        <div className="space-y-4">
          <Link 
            href={`/${params.tenant}/student`}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center group hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
          >
            <Play className="h-5 w-5 mr-3 fill-white" />
            Entrar al Curso
            <ArrowRight className="h-5 w-5 ml-3 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
          </Link>
          
          <Link 
            href={`/${params.tenant}/student/finance`}
            className="w-full bg-slate-50 text-slate-500 font-bold py-4 rounded-2xl border border-slate-100 block hover:bg-slate-100 transition-colors"
          >
            Ver Detalle de la Orden
          </Link>
        </div>

        <p className="text-[10px] text-slate-400 mt-10 uppercase font-bold tracking-widest">
          Orden ID: {searchParams.get('order') || 'ORD-SYNC-492'}
        </p>
      </div>
    </div>
  );
}
