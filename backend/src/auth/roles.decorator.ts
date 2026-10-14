import { SetMetadata } from '@nestjs/common';

/**
 * Clave de metadata usada por RolesGuard para leer los roles requeridos.
 */
export const ROLES_KEY = 'roles';

/**
 * Decorador para restringir el acceso a rutas según el rol del usuario.
 * Uso: @Roles('ADMIN') junto con @UseGuards(JwtAuthGuard, RolesGuard)
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
