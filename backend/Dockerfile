# 1. Etapa de compilación
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

# 2. Etapa de producción limpia y ligera
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./

RUN npm install --production
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]