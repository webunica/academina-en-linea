import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registra un estudiante de forma directa dentro del Tenant en curso.
   * Crea el registro del User Global + el bridge Profile y el Student local de la academia.
   */
  async registerStudent(tenantId: string, dto: RegisterDto) {
    // 1. Verificar existencia global del correo
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });

    let user = existingUser;

    if (!user) {
      // 2. Si no existe globalmente, creamos al Usuario
      const passwordHash = await bcrypt.hash(dto.password, 10);
      user = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash,
          profile: {
            create: {
              firstName: dto.firstName,
              lastName: dto.lastName,
            }
          }
        }
      });
    } else {
      // Si el correo ya existía (Tal vez es estudiante en OTRA academia), validamos que no esté duplicando subscripción aquí.
      const existingStudent = await this.prisma.student.findUnique({
        where: { tenantId_userId: { tenantId, userId: user.id } }
      });
      if (existingStudent) {
        throw new ConflictException('Ya existe un estudiante registrado con este correo en esta academia.');
      }
    }

    // 3. Unir al Usuario a la Academia (Tenant) específicamente como Estudiante
    const student = await this.prisma.student.create({
      data: {
        tenantId,
        userId: user.id,
      }
    });

    // Validar generador de JWT automáticamente al registrar si se desea:
    return this.generateAuthResponse(user.id, user.email, tenantId, 'STUDENT');
  }

  /**
   * Logeo estricto verificando que la contraseña coincida.
   */
  async login(tenantId: string, dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        // En un query complejo, buscaríamos también sus roles en esta academia.
        students: { where: { tenantId } },
        instructors: { where: { tenantId } },
        roles: { where: { tenantId } } // Tenant Admin / Roles genéricos
      }
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Inferir qué rol tiene en esta academia al momento de loguearse:
    let highestRoleScope = 'USER';
    if (user.roles.some((r) => true)) highestRoleScope = 'TENANT_ADMIN'; // Simplificado
    else if (user.instructors.length > 0) highestRoleScope = 'INSTRUCTOR';
    else if (user.students.length > 0) highestRoleScope = 'STUDENT';
    else {
      // Pertenece a la plataforma, pero no a esta academia en particular
      throw new UnauthorizedException('No tienes una cuenta activa en esta academia.');
    }

    return this.generateAuthResponse(user.id, user.email, tenantId, highestRoleScope);
  }

  /**
   * Utilidad para concentrar el cifrado del Payload
   */
  private generateAuthResponse(userId: string, email: string, tenantId: string, role: string) {
    const payload = { sub: userId, email, tenantId, role };
    const maxAge = 60 * 60 * 24; // 1 día en segundos, parametrizable después

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: userId,
        email,
        role,
        tenantId
      }
    };
  }
}
