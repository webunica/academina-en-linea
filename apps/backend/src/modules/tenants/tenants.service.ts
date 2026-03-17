import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import * as bcrypt from 'bcrypt';
import { RoleType } from '@prisma/client';
import { EmailService } from '../email/email.service';

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService
  ) {}

  /**
   * Proceso de Onboarding: Crea la Academia + Perfil del Admin en un mismo paso.
   */
  async create(dto: CreateTenantDto) {
    // 1. Validar que el slug no esté en uso
    const existingSlug = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug }
    });
    if (existingSlug) {
      throw new ConflictException(`El subdominio '${dto.slug}' ya se encuentra registrado.`);
    }

    // 2. Transacción para asegurar consistencia
    try {
      return await this.prisma.$transaction(async (tx) => {
        // a. Crear el Tenant
        const tenant = await tx.tenant.create({
          data: {
            name: dto.companyName,
            slug: dto.slug,
            settings: {
              create: {
                supportEmail: dto.adminEmail,
              }
            },
            brand: {
              create: {} // Default brand settings
            }
          }
        });

        // b. Upsert del Usuario (puede ya existir como estudiante en otra academia)
        let user = await tx.user.findUnique({
          where: { email: dto.adminEmail }
        });

        if (!user) {
          const passwordHash = await bcrypt.hash(dto.adminPassword, 10);
          user = await tx.user.create({
            data: {
              email: dto.adminEmail,
              passwordHash,
              profile: {
                create: {
                  firstName: dto.adminFirstName,
                  lastName: dto.adminLastName,
                }
              }
            }
          });
        }

        // c. Crear el Rol de Administrador para este Tenant específico
        // En un MVP, los permisos guardan un JSON con llaves maestras
        const adminRole = await tx.role.create({
          data: {
            tenantId: tenant.id,
            name: 'Administrador Academia',
            type: RoleType.TENANT_ADMIN,
            permissions: { all: true }
          }
        });

        // d. Asignar el Rol al Usuario en este Tenant
        await tx.userRole.create({
          data: {
            userId: user.id,
            tenantId: tenant.id,
            roleId: adminRole.id
          }
        });

        // e. Crear una suscripción de prueba (Fase 1 SaaS)
        // Buscamos un Plan base o lo ignoramos por ahora (opcional)

        const onboardingResult = {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          adminId: user.id
        };

        // f. Disparar Correo de Bienvenida (Asincrónico vía BullMQ)
        this.emailService.sendTransactionalEmail({
          tenantId: tenant.id,
          to: dto.adminEmail,
          templateName: 'welcome_tenant',
          variables: {
            adminName: dto.adminFirstName,
            academyName: dto.companyName,
            adminUrl: `https://${dto.slug}.academina.cl/admin`
          }
        }).catch(err => console.error('Error queuing welcome email:', err));

        return onboardingResult;
      });
    } catch (error) {
      console.error('Error during tenant onboarding:', error);
      throw new InternalServerErrorException('Error al crear la academia. Intente nuevamente.');
    }
  }

  async findBySlug(slug: string) {
    return this.prisma.tenant.findUnique({
      where: { slug },
      include: { brand: true }
    });
  }
}
