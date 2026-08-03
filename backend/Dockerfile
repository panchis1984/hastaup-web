FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm install

COPY . .

RUN npx prisma generate

# Compilar con nest build (elimina dist anterior y compila todo desde src/)
RUN npm run build

# Verificar que todos los módulos críticos existan antes de iniciar
RUN test -f /app/dist/main.js || (echo "❌ dist/main.js no encontrado" && ls -laR /app/dist/ && exit 1)
RUN test -f /app/dist/app.module.js || (echo "❌ dist/app.module.js no encontrado" && ls -laR /app/dist/ && exit 1)

EXPOSE 3001

CMD ["sh", "-c", "npx prisma db push && node dist/main.js"]