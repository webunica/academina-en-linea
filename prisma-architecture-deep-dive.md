# Notas de Diseño y Reglas de Aislamiento de Prisma (Fase 2)

El esquema de base de datos (`schema.prisma`) ha sido diseñado meticulosamente para cumplir con las más altas exigencias de una arquitectura SaaS B2B B2C para Academina. Aquí detallo las especificaciones técnicas inyectadas.

## 1. Arquitectura de Identificadores (UUID)
- **Decisión:** Todos los modelos usan `String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid`.
- **Razón:** El aprovisionamiento de IDs incrementales en un entorno B2B SaaS permite enumeración maliciosa (un atacante podría adivinar IDs de recursos de otras academias). UUIDv4 evita completamente esto y asegura una integración sencilla si se realizan importaciones de datos masivas.

## 2. Garantía de Aislamiento Multi-Tenant (`tenantId`)
- El esquema exige la propagación obligatoria de `tenantId` (y en muchos casos lo indexa o lo hace parte de llaves únicas compuestas).
- Modelos críticos como `UserRole`, `Course`, `PaymentTransaction`, e incluso `MediaAsset` tienen relación estricta en cascada (`onDelete: Cascade`) hacia `Tenant`.
- **Regla Práctica:** En NestJS, todas las consultas (queries) a bases de datos que no provengan del SuperAdmin DEBEN inyectar `{ where: { tenantId: req.tenantId } }`. Ya tenemos el campo en todos los modelos relevantes para soportar un Filtro Global de Prisma.

## 3. Modelo Híbrido de Usuarios (`User`, `UserRole`, `Tenant`)
- **Decisión:** `User` es global, pero el rol es contextual.
- **Razón:** Un usuario (estudiante o instructor) puede tener cuentas en la Academia A y en la Academia B utilizando el mismo correo (`email`).
- **Implementación:** La tabla `UserRole` almacena la relación ternaria: Usuario X tiene Rol Y en Academia Z. Esto permite a un mismo correo ser Instructor en el Tenant 1 y Estudiante en el Tenant 2 sin confictos.
- Las tablas dependientes `Student` e `Instructor` vinculan a un `userId` dentro de un `tenantId` (`@@unique([tenantId, userId])`).

## 4. Tipos Estrictos (Enums en Postgres)
Se establecieron `Enums` a nivel de base de datos para garantizar la limpieza de los estados:
- `RoleType`: Define niveles de poder sin requerir strings frágiles.
- `PaymentStatus` y `GatewayType`: Central para enrutar los pagos.
- `CourseStatus` y `EnrollmentStatus`: Fundamentales para mostrar vitrinas y restringir reproducciones de lecciones.

## 5. Idempotencia y Finanzas Seguras
- `PaymentTransaction`: Captura todas las variables contables (`amount`, `currency`).
- `PaymentWebhookLog`: Existe fuera del scope del tenant para guardar en bruto cada PING de MercadoPago/Webpay/PayPal antes de que nuestro servidor de procesamiento interno decida validarlos o no, operando como bitácora auditora contra caídas o transacciones duplicadas del proveedor.
- Precios e importes (`price`, `amount`) se definieron como `Int` para guardar el valor absoluto en centavos (ej: $5.00 USD = 500) o en pesos ($5000 CLP = 5000) de forma segura contra punto flotante.

## 6. Recursos Asíncronos y Media
- `MediaAsset` se comunica agnósticamente para aceptar el `providerId` de Bunny.net. Cada lección se asocia a este ID de manera no restrictiva para permitir un cambio fácil si a futuro la academia prefiere YouTube o Vimeo.

Con esta estructura Prisma, cumplimos todos los criterios de la Fase 2, garantizando relaciones sólidas y prevención de conflictos horizontales.
