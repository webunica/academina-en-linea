export default function TenantCatalogPage({ params }: { params: { tenant: string } }) {
  // Aquí se hace un fetch (ej. RSC en Next 14) al endpoint: /api/v1/tenants/{params.tenant}
  // para traer el branding de la academia, y sus cursos públicos.

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Personalizado del Tenant */}
      <nav className="bg-white border-b border-gray-200 py-4 px-8 flex justify-between items-center shadow-sm">
        <h1 className="text-2xl font-bold uppercase text-gray-800 tracking-wide">
          {params.tenant} Academy
        </h1>
        <div className="space-x-4">
          <a href={`/login`} className="text-gray-600 hover:text-gray-900 font-medium">Ingresar</a>
          <a href={`/register`} className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700">Registrarse</a>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-12 px-6">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-8">Catálogo de Cursos</h2>
        
        {/* Grilla de Cursos Fetchada Dinámicamente */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((courseId) => (
            <div key={courseId} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="h-48 bg-gray-300 w-full"></div> {/* Placeholder img */}
              <div className="p-6">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 block">Desarrollo Web</span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Fundamentos de Next.js</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">Aprende a construir aplicaciones dinámicas con React y Next.js App Router.</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">$50,000 CLP</span>
                  <a href={`/courses/fundamentos-nextjs`} className="text-blue-600 font-medium hover:underline">Ver Tópicos &rarr;</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
