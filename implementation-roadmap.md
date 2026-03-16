# Hoja de Ruta de Implementación (Roadmap)

## Flujo de Negocio Principal
1. **Registro SaaS:** Una empresa visita el landing principal del SaaS, selecciona un plan, paga (si no es gratuito) y se registra.
2. **Aprovisionamiento del Tenant:** El sistema crea un `Tenant`, `Roles` por defecto, asigna un subdominio y establece al usuario como Administrador de la Academia.
3. **Configuración de la Academia:** El Administrador inicia sesión, configura la marca (colores, logo) y configura al menos una Pasarela de Pago (por ejemplo, Webpay).
4. **Creación de Cursos:** El Instructor/Administrador crea un Curso, Secciones, Lecciones (sube un video a Bunny.net) y establece un precio.
5. **Compra del Estudiante:** Un estudiante visita el catálogo de la academia, hace clic en comprar.
6. **Flujo de Checkout:** El PaymentRouter verifica la moneda (CLP) y muestra Webpay. El usuario paga.
7. **Inscripción y Acceso:** El Webhook confirma el pago. El sistema genera una Inscripción (`Enrollment`), una Factura/Boleta (`Invoice`) y envía un Correo de Bienvenida. El estudiante accede a las lecciones.

## Hoja de Ruta MVP

### Roadmap v1: La Fundación
*Objetivo: Flujo End-to-End desde el registro del tenant hasta que un estudiante consume un curso gratuito de texto/video.*
- Configuración de Monorepo, NestJS CLI, Next.js App Router, Docker compose.
- Modelado del esquema de Prisma (Definición completa).
- Sistema Base de Autenticación (JWT, Guards).
- Módulo de Tenants (Aprovisionamiento, configuraciones, middleware de dominios).
- CRUD de Cursos (Curso básico, sección, lección con texto y archivos incrustados).
- Next.js: Vista del SuperAdmin (versión ligera), Registro SaaS, Catálogo Público de la Academia, Visor de Cursos.

### Roadmap v2: Listo para Comercialización y Medios
*Objetivo: Monetización dentro de Chile y entrega robusta de medios.*
- Integrar Bunny.net para entrega segura de videos.
- Integrar Mercado Pago y Webpay para checkouts en CLP.
- Implementar Control de Acceso avanzado (Instructores vs Administradores).
- Establecer lógica de Inscripción de Estudiantes y seguimiento interno de Progreso en los Cursos.
- Módulo de Correo vía SMTP y BullMQ para alertas transaccionales.

### Roadmap v3: Internacional, Académico y Escalabilidad
*Objetivo: Características completas de LMS y preparación para el mercado global.*
- Integrar checkout con PayPal para pagos internacionales (USD).
- Construir Tareas, Cuestionarios (opción múltiple, abiertas) y motor de Calificación manual.
- Construir generador de Certificados (PDF con QR/validación).
- Dashboard Global de Analítica y generación de Reportes (exportaciones CSV).
- Pulir Notificaciones, Eventos de Calendario, Suscripciones/Paquetes (Bundles).
