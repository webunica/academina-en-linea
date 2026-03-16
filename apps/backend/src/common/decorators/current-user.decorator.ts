import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../modules/auth/jwt.strategy';

// Este decorador extrae la carga real del JWT de manera limpia ahorrando código repetitivo
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Omit<JwtPayload, 'sub'> & { userId: string } => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
