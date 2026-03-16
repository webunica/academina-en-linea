import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Con este decorador protegeremos los controladores y servicios cerrados.
  // Ej: @UseGuards(JwtAuthGuard)
}
