# Documento de Arquitectura

## 1. Visión General de la Arquitectura
La plataforma se construirá como un Monolito Modular con una arquitectura cliente-servidor desacoplada.
- **Backend:** NestJS (Node.js, TypeScript), exponiendo APIs RESTful.
- **Frontend:** Next.js (App Router, React, TailwindCSS, TypeScript).
- **Base de Datos:** PostgreSQL (vía ORM Prisma).
- **Caché y Colas:** Redis con BullMQ para tareas asíncronas en segundo plano (correos electrónicos, webhooks).
- **Entrega de Medios:** Bunny.net para transmisión de video segura y de baja latencia.
- **Pagos:** Interfaz PaymentGateway abstraída que soporta Mercado Pago, Transbank (Webpay) y PayPal.

## 2. Estrategia Multi-Tenant: Base de datos compartida + `tenant_id`
**Decisión:** Utilizaremos una **Base de datos compartida con una columna `tenant_id`** en todas las tablas con alcance de tenant (academia).

**Justificación:**
1. **Mantenibilidad:** Un único esquema de base de datos significa que las migraciones de Prisma son simples y robustas. Un esquema por tenant en Prisma es notoriamente difícil de mantener y escalar.
2. **Entrega más rápida:** Podemos lograr un aislamiento lógico a nivel de ORM/aplicación utilizando servicios con alcance de solicitud (request-scoped) en NestJS o extensiones de cliente de Prisma (por ejemplo, Row Level Security o filtros globales), lo que acelera drásticamente el desarrollo en comparación con el pooling dinámico de conexiones.
3. **Costo Operativo y Escalabilidad:** Una sola base de datos reduce significativamente la sobrecarga de RDS/Cloud SQL y los límites de conexión, lo cual es ideal para un SaaS con un crecimiento constante.
4. **Aislamiento de Tenants:** Forzaremos la inyección de `tenant_id` en cada solicitud a través de un interceptor/middleware global en NestJS mapeado desde el dominio/subdominio o JWT.

## 3. Estructura de Carpetas de Alto Nivel
```text
/
├── apps/
│   ├── backend/                # Aplicación NestJS
│   │   ├── src/
│   │   │   ├── common/         # Guards, interceptores, decoradores, filtros
│   │   │   ├── config/         # Configuraciones tipadas (env)
│   │   │   ├── modules/        # Módulos de características (features)
│   │   │   ├── providers/      # Integraciones de terceros (Bunny.net, SMTP, Pagos)
│   │   │   └── main.ts         # Bootstrap
│   │   ├── prisma/             # Esquema, migraciones, seeders
│   │   └── ...
│   ├── frontend/               # Aplicación Next.js
│   │   ├── src/
│   │   │   ├── app/            # App router (páginas, layouts)
│   │   │   ├── components/     # Componentes de UI reutilizables
│   │   │   ├── lib/            # Utilidades, clientes de API
│   │   │   ├── hooks/          # Hooks de React
│   │   │   └── types/          # Interfaces compartidas
│   │   └── ...
├── docker-compose.yml          # Infraestructura local (Postgres, Redis)
├── README.md
├── architecture.md
├── module-map.md
├── implementation-roadmap.md
└── prisma-design-notes.md
```

## 4. Arquitectura de Pagos
Un sistema de enrutamiento desacoplado que separa el inicio del pago de la creación del pedido.
- **PaymentRouterService:** Analiza el código de moneda (CLP vs USD/etc) y la geolocalización del comprador.
  - Si `currency === 'CLP'`, permite *Mercado Pago* y/o *Webpay* según la configuración del tenant.
  - Si `currency !== 'CLP'`, permite *PayPal*.
- **Interfaz PaymentGateway:** Cada proveedor implementa métodos estándar `createTransaction()`, `verifyTransaction()`, `refund()`.
- **WebhookProcessorService:** Garantiza la idempotencia. Valida firmas y actualiza estados de transacciones sin condiciones de carrera (a menudo utilizando registros de bloqueo o Redis).

## 5. Arquitectura de Medios (Bunny.net)
- Solo almacenamos el `videoId` o `assetId` en nuestra base de datos.
- Usamos Edge Rules y URLs firmadas para una reproducción segura restringida al dominio exacto del tenant.
- El reproductor será un componente de video personalizado en Next.js.
