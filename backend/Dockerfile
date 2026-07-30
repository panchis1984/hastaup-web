FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm install

COPY . .

RUN npx prisma generate

# Compilar TypeScript (src/main.ts → dist/main.js)
RUN npx tsc -p tsconfig.build.json

# Verificar que el archivo principal exista antes de deployar
RUN test -f /app/dist/main.js || (echo "❌ dist/main.js no encontrado. Estructura de dist:" && ls -laR /app/dist/ && exit 1)

EXPOSE 3001

CMD ["sh", "-c", "npx prisma db push && node dist/main.js"]