FROM node:20-alpine AS base

# Dependencias necesarias para ciertos módulos de compilación en Nextjs
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Reconstruir el código asimilando configuraciones
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Deshabilitar telemetría de Next.js
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Imagen de Producción (Runner)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copiar archivos compilados y dependencias necesarias para Node env Server
COPY --from=builder /app/public ./public
# Automáticamente Next.js optimiza los archivos en una carpeta standalone en produccion (requiere output: 'standalone' en next.config)
# Pero podemos usar el server crudo para este demo si no está habilitado
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
