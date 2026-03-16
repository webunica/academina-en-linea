export default function CheckoutPage({ params }: { params: { tenant: string, courseId: string } }) {
  // Lógica: 1. Fetch precio en base al courseId y tenantId
  // 2. Fetch gateways activos. Ej: WEBPAY (CLP), MercadoPago (CLP), PayPal (USD)
  
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
        <div className="flex items-center justify-between mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold">Completar Compra</h1>
          <span className="text-sm text-gray-500 font-medium uppercase">{params.tenant} Academy</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Detalles del Producto */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Resumen del Pedido</h2>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Fundamentos de Next.js</span>
                <span className="font-medium">$50,000</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 border-b pb-4 mb-4">
                <span>Acceso de por vida</span>
              </div>
              <div className="flex justify-between font-bold text-xl">
                <span>Total Gasto</span>
                <span>$50,000 CLP</span>
              </div>
            </div>
          </div>

          {/* Opciones de Pago */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Métodos de Pago</h2>
            <form className="space-y-4">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="gateway" value="WEBPAY" className="h-5 w-5 text-blue-600 focus:ring-blue-500" defaultChecked />
                <span className="ml-3 font-medium text-gray-900">Webpay Plus (Redcompra / Crédito)</span>
              </label>

              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="gateway" value="MERCADOPAGO" className="h-5 w-5 text-blue-600 focus:ring-blue-500" />
                <span className="ml-3 font-medium text-gray-900">Mercado Pago</span>
              </label>

              {/* Si la moneda fuera USD, aquí inyectaríamos el label de PayPal */}

              <button 
                type="button" 
                className="w-full mt-8 bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition shadow-md"
              >
                Pagar $50,000 CLP
              </button>
            </form>
            <p className="text-xs text-center text-gray-400 mt-4">Transacción segura encriptada punto a punto.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
