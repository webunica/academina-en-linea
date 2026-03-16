# Mapa de Módulos

## 1. Módulos de Backend (NestJS)

- **Auth Module:** Autenticación (registro, login, logout, rotación de refresh tokens), manejo de Sesiones.
- **Tenants Module:** Gestión de tenants, aprovisionamiento de suscripciones SaaS, estado del tenant.
- **Tenant Settings Module:** Dominios, Branding (marca), Características activas por tenant.
- **Users Module:** SuperAdministradores, Administradores de Tenant, Instructores, Estudiantes.
- **Roles & Permissions Module:** Sistema RBAC (Control de Acceso Basado en Roles).
- **Plans & Billing Module:** Lógica de facturación de la plataforma SaaS para los tenants.
- **Courses Module:** Entidades de cursos, etiquetas, categorías, paquetes (bundles).
- **Academic Structure Module:** Secciones, Lecciones, Recursos de Lección.
- **Assignments Module:** Tareas, Entregas/Envíos.
- **Quizzes Module:** Cuestionarios/Pruebas, Bancos de Preguntas, Intentos, Respuestas.
- **Enrollments & Progress Module:** Inscripciones (matrículas) de estudiantes, seguimiento de lecciones, reglas de finalización de cursos.
- **Certificates Module:** Plantillas, Lógica de emisión, Verificación pública.
- **Payments Module:** Pasarelas de Pago (Mercado Pago, Webpay, Paypal), Transacciones, Webhooks, Facturas/Boletas, Cupones.
- **Notifications Module:** Anuncios dentro de la app, Disparadores de eventos (triggers).
- **Email Module:** Plantillas, Envío SMTP, Procesador BullMQ.
- **Media Module:** Seguimiento de activos de video, Sincronización con Bunny.net.
- **Calendar Module:** Sesiones en vivo, fechas de entrega.
- **Analytics Module:** Métricas del SuperAdmin, Métricas del Administrador de Tenant.
- **Audit Module:** Registro de auditoría de acciones de los usuarios.

## 2. Áreas de Aplicación y Páginas Frontend (Next.js)

### Áreas de Aplicación
El App Router de Next.js nos permite enrutar condicionalmente basándonos en dominios y subdominios (a nivel de middleware).

**A. SaaS Público (`/`)**
- Landing Page (`/`)
- Características (`/features`)
- Precios (`/pricing`)
- Onboarding / Registro de Empresa (`/register`)

**B. Dashboard del SuperAdmin (`/superadmin`)**
- Métricas Globales (`/superadmin/dashboard`)
- Gestor de Tenants (`/superadmin/tenants`)
- Planes SaaS (`/superadmin/plans`)

**C. Academia Pública del Tenant (Mapeada por subdominio o dominio personalizado)**
- Inicio (`/`)
- Catálogo (`/courses`)
- Detalle de un Curso (`/courses/[slug]`)
- Checkout (`/checkout/[courseId]`)
- Páginas de Autenticación (`/login`, `/register`, `/forgot-password`)
- Verificación de Certificado (`/verify/[code]`)

**D. Dashboard del Estudiante (`/student`)**
- Progreso y Dashboard (`/student/dashboard`)
- Mis Cursos (`/student/courses`)
- Visor de Lecciones (`/student/courses/[slug]/lesson/[id]`)
- Tareas y Cuestionarios (`/student/assignments`)
- Calendario (`/student/calendar`)
- Certificados (`/student/certificates`)

**E. Dashboard del Instructor (`/instructor`)**
- Dashboard (`/instructor/dashboard`)
- Gestión de Cursos (`/instructor/courses`)
- Calificación de Tareas (`/instructor/grading`)
- Calendario y Anuncios (`/instructor/calendar`)

**F. Dashboard del Administrador de Academia (`/admin`)**
- Configuraciones: Branding, Pasarelas de Pago, SMTP
- Gestor de Usuarios: Estudiantes e Instructores
- CRUD Completo de Cursos
- Reportes de Ventas y Analítica
