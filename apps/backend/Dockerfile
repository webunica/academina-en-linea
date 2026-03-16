FROM node:20-alpine AS builder

WORKDIR /app

# Archivos de empaquetado y package.json
COPY package*.json ./
COPY tsconfig*.json ./

# Dependencias e instalación de Prisma (CRÍTICO)
RUN npm ci

# Copiar el código fuente completo
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Compilar NestJS TypeScript a JS
RUN npm run build

# Imagen de Producción Limpia
FROM node:20-alpine

WORKDIR /app

# Configuración de variables (serán sobreescritas por docker-compose / kubernetes)
ENV NODE_ENV=production

# Copiar solo lo estrictamente necesario desde la etapa del Builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001

# Ejecutar las migraciones y luego iniciar el servidor
CMD ["sh", "-c", "npx prisma db push && npm run start:prod"]
