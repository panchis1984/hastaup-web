import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitamos CORS solo para el origen del frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
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

  const startPort = Number(process.env.PORT) || 3001;
  let port = startPort;
  const maxAttempts = 5;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await app.listen(port);
      console.log(`Nest application listening on port ${port}`);
      break;
    } catch (err: any) {
      if (err && err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} in use, trying port ${port + 1}...`);
        port += 1;
        if (attempt === maxAttempts - 1) {
          console.error('No available ports after multiple attempts.');
          throw err;
        }
      } else {
        throw err;
      }
    }
  }
}
bootstrap();
