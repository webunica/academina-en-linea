import { Controller, Post, Body, Get, Param, NotFoundException } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  /**
   * Endpoint de Onboarding: Captura leads desde la landing page.
   * Crea el Tenant, User, Role de Admin y primer Admin en un solo paso.
   */
  @Post()
  async create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  /**
   * Utilidad para verificar disponibilidad de Subdominio en tiempo real.
   */
  @Get('check/:slug')
  async checkAvailability(@Param('slug') slug: string) {
    const tenant = await this.tenantsService.findBySlug(slug);
    return { available: !tenant };
  }

  /**
   * Ver detalle de academia por su slug (útil para el frontend al cargar cabeceras dinámicas).
   */
  @Get('slug/:slug')
  async getBySlug(@Param('slug') slug: string) {
    const tenant = await this.tenantsService.findBySlug(slug);
    if (!tenant) throw new NotFoundException('Academia no encontrada');
    return tenant;
  }
}
