# 1. Etapa de compilación (Builder)
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./

RUN npm install
COPY . .

# ¡Importante! Generamos el cliente de Prisma antes de compilar NestJS
RUN npx prisma generate

# Compilamos NestJS
RUN npm run build

# 2. Etapa de producción final
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm install --production
RUN npx prisma generate

# Copiamos la carpeta dist generada
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]