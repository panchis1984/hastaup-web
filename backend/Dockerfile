# ── Build Stage ─────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm install

COPY . .

RUN npx prisma generate

# Compilar TypeScript directamente (invalida el cache envenenado de nest build)
# Muestra errores reales de TypeScript si los hay
RUN npx tsc -p tsconfig.build.json --listEmittedFiles

# Verificar que el archivo principal exista
RUN test -f /app/dist/main.js || (echo "❌ dist/main.js no encontrado" && ls -la /app/dist/ 2>/dev/null && exit 1)

EXPOSE 3001

CMD sh -c "npx prisma db push && node dist/main.js"