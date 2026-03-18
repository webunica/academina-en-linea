import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
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

      if (hostname === 'localhost') {
        // Fallback local: si estamos en localhost:3000, leemos la ruta `pathname` para /slug/..
        const pathSegments = window.location.pathname.split('/');
        // Evitamos inyectarlo si estamos en páginas generales SaaS en localhost
        const isSaaSPage = ['register', 'login', 'pricing', ''].includes(pathSegments[1]);
        
        if (pathSegments.length > 1 && !isSaaSPage) {
           config.headers['x-tenant-slug'] = pathSegments[1];
        } else if (!isSaaSPage) {
           config.headers['x-tenant-slug'] = 'demo-academy';
        }
      } else if (!isRootDomain) {
        // Estamos en un dominio público real que NO es la raíz del SaaS
        // Ej: "miempresa.academina.cl" -> "miempresa"
        const domainParts = hostname.split('.');
        if (domainParts.length >= 3) {
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
