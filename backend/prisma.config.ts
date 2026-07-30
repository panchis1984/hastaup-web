import "dotenv/config";
import { defineConfig } from '@prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: './prisma/schema.prisma', // o la ruta a tu esquema
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
