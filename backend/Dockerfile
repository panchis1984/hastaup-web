# 1. Etapa de compilación
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# 2. Etapa de producción
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate

EXPOSE 3001
CMD ["node", "dist/main.js"]