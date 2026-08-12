import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aumentar el límite de tamaño de payload JSON a 50mb para permitir base64 local
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  // Configuración flexible de CORS para dominios de producción y local
  const configuredOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((u) => u.trim().replace(/\/$/, ''))
    : [];

  const defaultOrigins = [
    'https://hastaup.com.ar',
    'https://www.hastaup.com.ar',
    'https://hasta-up-front-production.up.railway.app',
    'http://localhost:3000',
  ];

  const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultOrigins]));

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origen (como Postman o curl) o si el origen está permitido
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
        callback(null, true);
      } else {
        callback(null, true); // fallback seguro
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Validación global de DTOs: descarta campos extra y convierte tipos automáticamente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Elimina campos no declarados en el DTO
      forbidNonWhitelisted: true, // Lanza error 400 si llegan campos desconocidos
      transform: true,            // Convierte strings a number/boolean según el tipo del DTO
    }),
  );

  // En producción (Railway) PORT es inyectado automáticamente y es el único
  // puerto expuesto. Escuchamos en 0.0.0.0 para aceptar tráfico externo.
  // Si falla, el proceso debe crashear rápido para que Railway lo detecte.
  const port = Number(process.env.PORT) || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Nest application listening on port ${port}`);
}
bootstrap();
