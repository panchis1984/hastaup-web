FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./

RUN npm install
COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

COPY prisma ./prisma

RUN npm install --production
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]