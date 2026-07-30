# Etapa única — más simple para diagnosticar
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm install

COPY . .

RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# ── VERIFICACIÓN: Si este paso falla, dist/ no se generó ──
RUN ls -la /app/dist/main.js

EXPOSE 3001

CMD sh -c "npx prisma db push && node dist/main.js"