export default function SaasLandingPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-6">
          Vende tus cursos al mundo.<br/> Operado localmente.
        </h1>
        <p className="text-xl text-neutral-400 mb-10">
          La primera plataforma LMS B2B B2C 100% optimizada para Chile. 
          Cobra en Pesos vía Webpay o MercadoPago, y en Dólares vía PayPal.
        </p>
        <div className="flex justify-center gap-4">
          <a href="/register" className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 font-semibold rounded-lg transition">
            Crear mi Academia
          </a>
          <a href="/pricing" className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 font-semibold rounded-lg transition">
            Ver Planes
          </a>
        </div>
      </div>
    </main>
  );
}
