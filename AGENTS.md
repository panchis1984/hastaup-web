# AGENTS.md

Hasta Up: web de inmuebles + subastas/eventos. Dos apps npm **independientes**, sin workspace raíz.

## Layout
- `backend/` — NestJS 11 + Prisma 7 + PostgreSQL (Neon). Correr comandos dentro de `backend/`.
- `frontend/` — Next.js 16 App Router + React 19 + Tailwind v4. Correr comandos dentro de `frontend/`.
- `docker-compose.yaml` (raíz) — Postgres local + ambas apps (API :3001, web :3000).
- No hay `package.json` en la raíz: nunca ejecutar npm desde la raíz.

## Comandos
Backend (en `backend/`):
- `npm run start:dev` — dev con watch
- `npm run build` — `nest build` (borra `dist/`; `deleteOutDir` en nest-cli.json)
- `npx tsc --noEmit -p tsconfig.build.json` — typecheck (no hay script)
- `npm run lint` — ESLint con `--fix` + Prettier (singleQuote, trailingComma all)
- `npx prisma generate` — regenerar cliente tras editar el schema

Frontend (en `frontend/`):
- `npm run dev` / `npm run build` / `npm run lint`
- `npx tsc --noEmit` — typecheck (no hay script). No hay suite de tests.

## Verificación (importante)
- Los `*.spec.ts` del backend son scaffolds de Nest sin mocks de `PrismaService`/`JwtService` → `npm test` y `npm run test:e2e` **fallan**. NO usarlos como check.
- Verificar con `npm run build` (o `tsc --noEmit`). No hay CI.

## Backend — arquitectura
- Entry `src/main.ts`: ValidationPipe global (`whitelist` + `forbidNonWhitelisted` + `transform`), JSON limit 50mb.
- CORS: allowlist = `FRONTEND_URL` (separado por comas) + defaults hardcodeados en `main.ts` (`hastaup.com.ar`, `www.`, `hasta-up-front-production.up.railway.app`, `localhost:3000`). Orígenes desconocidos se rechazan.
- `JWT_SECRET` es **obligatorio**: `getJwtSecret()` lanza error en bootstrap si falta. No reintroducir fallback.
- Auth JWT (Passport). `POST /auth/login` → `{ accessToken, data }`; payload `{ sub, email, role }`.
- Rutas admin: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN')` (definidos en `src/auth/`). Las de lectura pública no llevan guarda. Reusar en nuevos endpoints admin.
- `PrismaService` (`src/prisma/`) es `@Global` y usa el driver adapter `@prisma/adapter-pg` sobre un `Pool` de `pg` con `ssl.rejectUnauthorized:false` (Neon). `PrismaModule` se importa una vez.
- Favoritos y eventos guardados son arrays `String[]` en `User` (sin tablas intermedias).
- Emails de contacto vía **Resend**, fire-and-forget: requiere `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_DESTINATION`. Ignorar las viejas `MAIL_HOST/PORT/USER/PASS` del `.env.example` (obsoletas).

## Deploy (Railway / Docker)
- `backend/Dockerfile` CMD: `prisma db push --accept-data-loss && node dist/main.js`. Producción aplica el schema con **db push**, no `migrate deploy`, pese a que `prisma/migrations/` existe → los cambios de schema pueden borrar datos.
- `frontend/Dockerfile`: build multi-stage con `output: "standalone"`. `NEXT_PUBLIC_*` se **embeben en build** (ARGs del Dockerfile): cambiarlas exige redeploy.
- Backend escucha en `PORT` (inyectado por Railway) o 3001.

## Convenciones
- Comentarios y textos de UI en **español**.
- Frontend: alias `@/*` → `src/*`. Imágenes remotas permitidas solo de `images.unsplash.com` y `res.cloudinary.com` (`next.config.ts`).
- Imágenes: suben a Cloudinary si `NEXT_PUBLIC_CLOUDINARY_*` está seteado; si no, se comprimen a data-URL Base64 (payloads grandes).
- Trampa: `backend/prisma/prisma.service.ts` está vacío y sin usar; el real es `backend/src/prisma/prisma.service.ts`.
