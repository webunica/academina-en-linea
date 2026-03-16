import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

// Dominios principales de la Plataforma SaaS (NO son tenants)
const ROOT_HOSTNAMES = [
  'academina.cl',
  'www.academina.cl',
  'localhost',
  'localhost:3000',
];

// Sufijos de Vercel/Railway que también son dominios raíz de plataforma
const ROOT_HOSTNAME_SUFFIXES = [
  '.vercel.app',
  '.up.railway.app',
];

function isRootPlatformDomain(hostname: string): boolean {
  // Verificar dominios exactos 
  if (ROOT_HOSTNAMES.includes(hostname)) return true;

  // Verificar dominios de preview de Vercel / Railway
  for (const suffix of ROOT_HOSTNAME_SUFFIXES) {
    if (hostname.endsWith(suffix)) return true;
  }

  return false;
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host') || '';

  // Pasar recursos estáticos sin procesamiento
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const rootDomain = isRootPlatformDomain(hostname);

  if (rootDomain) {
    // Dominio raíz SaaS → mostrar landing y páginas de plataforma
    if (url.pathname === '/') {
      url.pathname = '/saas';
      return NextResponse.rewrite(url);
    }
    if (url.pathname === '/register') {
      url.pathname = '/saas/register';
      return NextResponse.rewrite(url);
    }
    // Rutas /saas/* las dejamos pasar tal cual
    return NextResponse.next();
  }

  // --- Lógica de TENANTS (subdominios o dominios propios) ---
  // Extraer slug del tenant del hostname
  // Ej: "miacademia.academina.cl" → "miacademia"
  // Ej: "miacademia.localhost" → "miacademia" (para dev local)
  let tenantSlug = hostname
    .replace('.academina.cl', '')
    .replace('.www.academina.cl', '')
    .replace('.localhost:3000', '')
    .replace('.localhost', '');

  // Si la ruta ya empieza con el slug del tenant (dev local con /[tenant]/*), pasar directo
  if (url.pathname.startsWith(`/${tenantSlug}`)) {
    return NextResponse.next();
  }

  // Reescribir invisiblemente agregando el tenant al inicio de la ruta
  url.pathname = `/${tenantSlug}${url.pathname}`;
  return NextResponse.rewrite(url);
}
