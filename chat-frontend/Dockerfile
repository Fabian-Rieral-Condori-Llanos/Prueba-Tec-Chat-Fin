# ==============================================
# STAGE 1: Dependencies
# ==============================================
FROM node:24-alpine AS deps

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# ==============================================
# STAGE 2: Build
# ==============================================
FROM node:24-alpine AS builder

WORKDIR /app

# Copiar dependencias desde stage anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Variables de entorno necesarias para build
ENV NEXT_TELEMETRY_DISABLED 1

# Build de Next.js
RUN npm run build

# ==============================================
# STAGE 3: Runtime
# ==============================================
FROM node:24-alpine AS runner

WORKDIR /app

# Variables de entorno
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Instalar herramientas para healthcheck
RUN apk add --no-cache wget

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios desde builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Ejecutar aplicación
CMD ["node", "server.js"]