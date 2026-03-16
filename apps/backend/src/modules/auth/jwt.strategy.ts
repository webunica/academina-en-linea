import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Extrae el token desde la cabecera del formato: "Bearer eyJhbxxx..."
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'super_secret_academina_fallback_382942'),
    });
  }

  async validate(payload: JwtPayload) {
    // Aquí puedes incluir una consulta extra de base de datos si quieres ser agresivamente seguro,
    // pero idealmente, confiaremos en la validez criptográfica para que sea Stateless.
    return { 
      userId: payload.sub, 
      email: payload.email, 
      tenantId: payload.tenantId, 
      role: payload.role 
    };
  }
}
