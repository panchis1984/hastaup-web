import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  [x: string]: any;
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    // Configuramos el Pool indicándole explícitamente que use SSL para Neon.tech
    const pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false, // Necesario para conexiones seguras en la nube
      },
    });

    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Base de datos conectada exitosamente a Neon.tech');
    } catch (error) {
      console.error('❌ Error al conectar a la base de datos:', error);
    }
  }
}
