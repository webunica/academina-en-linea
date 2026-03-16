import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

// Dominios principales del SaaS (Platform)
const ROOT_URLS = ['academina.cl', 'localhost:3000', 'www.academina.cl'];

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Permitir la exclusión de recursos estáticos
  if (url.pathname.includes('.') || url.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Comprobar si estamos en el dominio raíz SaaS o en un Tenant (subdominio o dominio propio)
  const isRootDomain = ROOT_URLS.includes(hostname);

  if (!isRootDomain) {
    // Es un tenant. Extraemos el subdominio o usamos el dominio personalizado
    // Ej: "mia-academia.academina.cl" -> "mia-academia"
    const tenantIdentifier = hostname.replace('.academina.cl', '').replace('.localhost:3000', '');

    // Reescribimos la URL para que Next.js renderice la carpeta /[tenant]/...
    // Inyectamos internamente la ruta sin cambiar la URL visible en el navegador
    return NextResponse.rewrite(new URL(`/${tenantIdentifier}${url.pathname}`, req.url));
  }

  // Si estamos en el SaaS, puedes enrutar a las rutas generales de empresa
  if (url.pathname === '/') {
    return NextResponse.rewrite(new URL(`/saas`, req.url)); 
  }
  
  if (url.pathname.startsWith('/register')) {
    return NextResponse.rewrite(new URL(`/saas/register`, req.url));
  }

  return NextResponse.next();
}
