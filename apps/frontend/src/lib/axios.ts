import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const apiClient = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1').trim(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar Token de seguridad y Tenant Header
apiClient.interceptors.request.use(
  (config) => {
    // 1. Obtener la sesión actual desde Zustand
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Extraer el Subdominio (Tenant Slug) de la URL actual en el Frontend
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      // Lista de dominios que pertenecen a la PLATAFORMA (SaaS) y que NO son academias
      const isRootDomain = 
        hostname === 'academina.cl' || 
        hostname === 'www.academina.cl' || 
        hostname.endsWith('.vercel.app') || 
        hostname.endsWith('.up.railway.app');

      if (isRootDomain || hostname === 'localhost') {
        // En localhost o dominios maestros de Vercel/SaaS, no tenemos subdominios, 
        // así que miramos el path (ej: /ipsdatax/login)
        const pathSegments = window.location.pathname.split('/');
        const firstSegment = pathSegments[1] || '';
        
        // Paginas que definitivamente son de Plataforma y no de academia
        const isSaaSPage = ['register', 'pricing', ''].includes(firstSegment);
        
        if (firstSegment && !isSaaSPage && firstSegment !== 'api' && firstSegment !== '_next') {
           // Asumimos que la primera parte de la ruta es el tenant (path-based routing)
           config.headers['x-tenant-slug'] = firstSegment;
        } else {
           // En páginas pure SaaS (como /register o /), eliminamos la cabecera por completo
           delete config.headers['x-tenant-slug'];
        }
      } else {
        // Estamos en un dominio público real de ACADEMIA (ej: miempresa.academina.cl)
        // o en un custom domain mapeado (ej: mipropiaacademia.com)
        const domainParts = hostname.split('.');
        // Subdominio normal (miacademia.academina.cl -> ['miacademia', 'academina', 'cl'])
        if (domainParts.length >= 3) {
          config.headers['x-tenant-slug'] = domainParts[0];
        } else {
          // Si es un dominio propio "miacademia.com", usaremos el header hostnatgme completo (backend debe resolverlo)
          // Para el MVP asumimos subdominios siempre.
          config.headers['x-tenant-slug'] = domainParts[0]; 
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
