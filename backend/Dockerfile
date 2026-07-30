# ── Etapa 1: Build ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias (todas, incluyendo devDependencies para compilar)
COPY package*.json ./
RUN npm install

# Copiar el schema de Prisma y generar el cliente
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

# Copiar el resto del código y compilar TypeScript → dist/
COPY . .
RUN npm run build

# ── Etapa 2: Runtime ─────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Solo dependencias de producción
COPY package*.json ./
RUN npm install --omit=dev

# Copiar el cliente de Prisma generado y el schema
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma
COPY prisma.config.ts ./

# Copiar el build compilado
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD sh -c "npx prisma db push && node dist/main.js"