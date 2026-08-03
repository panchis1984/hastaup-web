import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitamos CORS solo para el origen del frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
