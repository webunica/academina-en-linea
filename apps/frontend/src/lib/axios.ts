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
      // Extraemos todo lo que esté antes del dominio principal, ej: "tuempresa.academina.cl" -> "tuempresa"
      const domainParts = hostname.split('.');
      if (domainParts.length >= 3) {
        config.headers['x-tenant-slug'] = domainParts[0];
      } else if (hostname === 'localhost') {
        // Fallback local: si estamos en localhost:3000, leemos la ruta `pathname` para /slug/.. (Comportamiento Middleware Phase 4)
        const pathSegments = window.location.pathname.split('/');
        if (pathSegments.length > 1 && pathSegments[1] !== 'saas' && pathSegments[1] !== '') {
           config.headers['x-tenant-slug'] = pathSegments[1];
        } else {
           // Tenant estático de prueba si nada se cumple localmente
           config.headers['x-tenant-slug'] = 'demo-academy';
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
