'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  ChevronRight, 
  Loader2, 
  AlertCircle,
  CreditCard,
  Lock
} from 'lucide-react';
import { apiClient } from '@/lib/axios';

interface Course {
  id: string;
  title: string;
  price: number;
  currency: string;
}

export default function CheckoutPage({ params }: { params: { tenant: string, courseId: string } }) {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gateway, setGateway] = useState('WEBPAY');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // 1. Fetch info del curso (el backend debe soportar búsqueda por UUID)
    apiClient.get(`/courses/${params.courseId}`)
      .then(res => {
        setCourse(res.data);
        setLoading(false);
      })
      .catch(() => setError('No pudimos cargar la información del curso.'));
  }, [params.courseId]);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError('');
      
      const response = await apiClient.post('/payments/initiate', {
        courseId: params.courseId,
        gateway: gateway
      });

      // Si el gateway retorna una URL de redirección (Ej: Transbank o MercadoPago)
      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        setError('El proveedor de pago no respondió correctamente.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar el pago. Intenta más tarde.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
     <div className="min-h-screen flex items-center justify-center bg-slate-50">
       <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
     </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Finalizar Compra</h1>
            <p className="text-slate-500 mt-1">Acceso inmediato tras confirmación del banco.</p>
          </div>
          <div className="hidden md:flex items-center text-slate-400 gap-2 text-sm font-bold uppercase tracking-widest">
            <Lock className="h-4 w-4" /> Pago Seguro
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Resumen del Contenido */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                <ShieldCheck className="h-5 w-5 mr-3 text-emerald-500" />
                Resumen del Programa
              </h2>
              
              <div className="flex gap-6 items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="h-16 w-16 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                   <CreditCard className="h-8 w-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{course?.title}</h3>
                  <p className="text-sm text-slate-500">Acceso de por vida • Certificado incluido</p>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100 space-y-3">
                 <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>${course?.price.toLocaleString('es-CL')}</span>
                 </div>
                 <div className="flex justify-between text-slate-600">
                    <span>Impuestos (IVA inclusivo)</span>
                    <span>$0</span>
                 </div>
                 <div className="flex justify-between text-xl font-extrabold text-slate-900 pt-4">
                    <span>Total a Pagar</span>
                    <span>${course?.price.toLocaleString('es-CL')} {course?.currency}</span>
                 </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex gap-4 text-blue-800">
               <AlertCircle className="h-6 w-6 flex-shrink-0" />
               <p className="text-sm leading-relaxed">
                 Al completar la compra, recibirás un correo de bienvenida y tus credenciales de acceso se activarán automáticamente.
               </p>
            </div>
          </div>

          {/* Gateways Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Método de Pago</h2>
              
              <div className="space-y-4">
                <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${gateway === 'WEBPAY' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-300'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input type="radio" name="gateway" value="WEBPAY" onChange={(e) => setGateway(e.target.value)} checked={gateway === 'WEBPAY'} className="h-4 w-4 text-blue-600" />
                      <span className="ml-3 font-bold text-slate-800">Webpay Plus</span>
                    </div>
                    <img src="https://www.transbank.cl/public/img/logo-webpay-plus.png" className="h-4 grayscale hover:grayscale-0 transition-opacity" alt="Webpay" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 ml-7">Tarjetas de Débito y Crédito Bancarias</p>
                </label>

                <label className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${gateway === 'MERCADOPAGO' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-300'}`}>
                   <div className="flex items-center">
                    <input type="radio" name="gateway" value="MERCADOPAGO" onChange={(e) => setGateway(e.target.value)} checked={gateway === 'MERCADOPAGO'} className="h-4 w-4 text-blue-600" />
                    <span className="ml-3 font-bold text-slate-800">Mercado Pago</span>
                   </div>
                   <p className="text-[10px] text-slate-400 mt-2 ml-7">Saldo MP, Débito o Cuotas</p>
                </label>
              </div>

              {error && (
                <div className="mt-6 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" /> {error}
                </div>
              )}

              <button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full mt-10 bg-slate-900 text-white font-extrabold py-5 rounded-2xl hover:bg-slate-800 shadow-xl transition-all active:scale-[0.98] flex items-center justify-center disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin h-5 w-5 mr-3" />
                ) : (
                  <>Pagar Ahora <ChevronRight className="h-5 w-5 ml-2" /></>
                )}
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 grayscale">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="Paypal" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
