FROM node:20-alpine

WORKDIR /app

# Copiamos los archivos de dependencias y el esquema de prisma
COPY package*.json ./
COPY prisma ./prisma

# Instalamos todas las dependencias (incluyendo devDependencies para poder compilar)
RUN npm install

# Copiamos el resto del código fuente del backend
COPY . .

# Generamos el cliente de Prisma y compilamos NestJS
RUN npx prisma generate
RUN npm run build

EXPOSE 3001

# Iniciamos la aplicación directamente
CMD ["node", "dist/main.js"]