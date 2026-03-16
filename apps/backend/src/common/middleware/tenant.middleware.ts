import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { RequestWithTenant } from '../interfaces/request-with-tenant.interface';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: RequestWithTenant, res: Response, next: NextFunction) {
    // 1. Extraer el tenant desde el Header 'x-tenant-slug' o el Origen (Hostname)
    // En producción SaaS, el frontend Next.js nos envía el identificador de la academia actual
    const tenantSlug = req.headers['x-tenant-slug'] as string;

    if (!tenantSlug) {
      // Si la ruta es pública SaaS (ej: registro de empresa) lo dejamos pasar sin tenantId.
      // Queda bajo responsabilidad de los Guards restringir rutas sin tenant.
      return next(); 
    }

    // 2. Buscar el Tenant en Base de Datos (Ideal Cache en Redis a futuro)
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { id: true, slug: true, isActive: true },
    });

    if (!tenant) {
      throw new BadRequestException(`Tenant not found for slug: ${tenantSlug}`);
    }

    if (!tenant.isActive) {
      throw new BadRequestException('This academy is currently disabled.');
    }

    // 3. Inyectar el ID real (UUID) en el Scope del Request para el resto de la App (Controladores/Servicios)
    req.tenantId = tenant.id;
    req.tenantSlug = tenant.slug;

    next();
  }
}
