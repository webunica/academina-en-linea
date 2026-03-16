export default function StudentDashboard({ params }: { params: { tenant: string } }) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="bg-white border-b px-8 py-4 flex justify-between items-center">
        <div className="font-bold text-xl uppercase tracking-widest">{params.tenant}</div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Hola, Matias</span>
          <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">M</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-10 px-8">
        <h1 className="text-3xl font-extrabold mb-8">Mis Cursos Activos</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
            <div className="h-32 bg-indigo-100 rounded-xl mb-4"></div>
            <h3 className="font-bold text-lg mb-2">Fundamentos de Next.js</h3>
            <div className="w-full bg-neutral-200 rounded-full h-2.5 mb-2 mt-4">
              <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
            <p className="text-xs text-neutral-500 font-medium text-right mb-6">45% Completado</p>
            <a href={`/student/courses/nextjs/lesson/3`} className="block text-center w-full py-3 rounded-lg bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition">
              Continuar Aprendiendo
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
