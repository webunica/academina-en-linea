export default function CompanyOnboardingRegister() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Registra tu Empresa
        </h2>
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Academia</label>
            <input type="text" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ej: Instituto Chileno" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subdominio deseado</label>
            <div className="flex border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500">
              <input type="text" className="w-full px-4 py-2 outline-none" placeholder="mi-instituto" />
              <span className="bg-gray-100 px-4 py-2 text-gray-500 border-l">.academina.cl</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email del Administrador</label>
            <input type="email" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="admin@empresa.cl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input type="password" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="••••••••" />
          </div>
          <button type="button" className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-md hover:bg-emerald-700 transition">
            Comenzar Prueba Gratis (14 días)
          </button>
        </form>
      </div>
    </div>
  );
}
