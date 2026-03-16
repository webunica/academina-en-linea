import { Controller, Post, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestWithTenant } from '../../common/interfaces/request-with-tenant.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: RequestWithTenant, @Body() loginDto: LoginDto) {
    // Se fuerza siempre a loguearse bajo el tenant provisto por el middleware (el subdominio que visita)
    return this.authService.login(req.tenantId, loginDto);
  }

  @Post('register')
  async register(@Req() req: RequestWithTenant, @Body() registerDto: RegisterDto) {
    // Alguien creándose una cuenta directo desde el cátalogo de la Academia como alumno
    return this.authService.registerStudent(req.tenantId, registerDto);
  }
}
