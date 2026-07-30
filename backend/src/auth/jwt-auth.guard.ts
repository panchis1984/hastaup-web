import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard que protege rutas requiriendo un JWT válido en el header Authorization.
 * Uso: @UseGuards(JwtAuthGuard) en el controlador o en el método.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw new UnauthorizedException('Acceso no autorizado. Token inválido o expirado.');
    }
    return user;
  }
}
