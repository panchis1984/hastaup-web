# 1. Etapa de compilación
FROM node:18-alpine AS builder

WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./
COPY prisma ./

# Instalamos TODAS las dependencias (incluyendo devDependencies para compilar TypeScript)
# Usamos --legacy-peer-deps o npm install estándar según tu proyecto
RUN npm install

# Copiamos el resto del código del backend
COPY . .

# Generamos el cliente de Prisma y compilamos NestJS
RUN npx prisma generate
RUN npm run build

# 2. Etapa de producción limpia y ligera
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./

# Instalamos únicamente producción para el runtime final
RUN npm install --production
RUN npx prisma generate

# Copiamos los archivos compilados desde la etapa anterior
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]