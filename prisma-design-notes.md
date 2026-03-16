# Notas de Diseño de Prisma

## Principios Centrales de Diseño
1. **Aislamiento de Tenants:** Todas las tablas que pertenecen a una academia específica DEBEN tener una clave foránea `tenantId`. Utilizaremos Extensiones de Cliente de Prisma (o middleware de NestJS) para inyectar automáticamente el `tenantId` en las consultas para evitar fugas horizontales de datos.
2. **Borrados Lógicos (Soft Deletes):** Las entidades clave como `Tenant`, `User`, `Course`, `Enrollment` y `PaymentTransaction` deben implementar borrados lógicos (`deletedAt DateTime?`) para mantener la integridad referencial de los registros financieros y académicos históricos.
3. **Identificadores (IDs):** Utilizaremos `UUID` a través de `uuid-ossp` o `gen_random_uuid()` de PostgreSQL para prevenir ataques de enumeración y facilitar la fusión de conjuntos de datos si es necesario más adelante.

## Aspectos Destacados de Tablas Esperadas
- `Tenant`: Representa la Academia (cliente SaaS).
- `User`: Tabla global de usuarios. Los usuarios pueden pertenecer a múltiples Tenants lógicamente.
- `UserRole`: Mapeo Muchos-a-Muchos para `User` <-> `Tenant` <-> `Role`.
- `Course`, `Section`, `Lesson`: El árbol académico central.
- `PaymentTransaction`: Capturará el payload de la pasarela dinámicamente dentro de una columna `JSONB` para ayudar en la depuración sin alterar el esquema por cada pasarela.
- `PaymentWebhookLog`: Libro mayor inmutable de todos los webhooks recibidos, procesados cuidadosamente para garantizar la idempotencia.
- `TenantDomain`: Rastrea los subdominios mapeados y los dominios personalizados.

## Tipos de Datos
- Los Estados (ej., Estado de Transacción, Estado de Inscripción, Estado de Curso) deben ser `ENUM`s de PostgreSQL por rendimiento y tipado estricto.
- Los Precios deben almacenarse como `Decimal` o `Int` (en centavos/la denominación más baja). Para el CLP, los enteros estándar funcionan perfectamente ya que no hay pesos fraccionarios. Para el USD, la práctica estándar es usar centavos. Utilizaremos `Int` y almacenaremos la unidad de moneda más pequeña.

## Estrategia de Índices
- Índice único compuesto en `[slug, tenantId]` para los Cursos.
- Índice en `tenantId` en todas las tablas con alcance de tenant.
- Índice en `email` en la tabla User.
- Índice en `gatewayTransactionId` en `PaymentTransaction` para búsquedas rápidas de webhooks.
