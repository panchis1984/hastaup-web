# 1. Etapa de compilación
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos package.json y package-lock.json
COPY package*.json ./
COPY prisma ./

# Instalamos todo (incluyendo dependencias de desarrollo para compilar)
RUN npm install

# Copiamos todo el código fuente
COPY . .

# Generamos Prisma y compilamos NestJS explícitamente
RUN npx prisma generate
RUN npm run build

# 2. Etapa de producción final
FROM node:20-alpine

WORKDIR /app

# Copiamos dependencias y esquema de base de datos
COPY package*.json ./
COPY prisma ./

# Instalamos solo producción para mantener la imagen ligera
RUN npm install --production
RUN npx prisma generate

# Copiamos la carpeta dist generada en la etapa anterior
COPY --from=builder /app/dist ./dist

EXPOSE 3001

# Ejecutamos las migraciones de Prisma y luego iniciamos la app
CMD npx prisma migrate deploy && node dist/main.js