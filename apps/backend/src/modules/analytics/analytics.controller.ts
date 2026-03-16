import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { RequestWithTenant } from '../../common/interfaces/request-with-tenant.interface';

// Aquí irían los Guards reales de Autenticación y Autorización
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { RolesGuard } from '../roles/roles.guard';
// import { Roles } from '../roles/roles.decorator';

@Controller('analytics')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  // @Roles('TENANT_ADMIN', 'SUPERADMIN')
  async getDashboardMetrics(@Req() req: RequestWithTenant) {
    // req.tenantId viene inyectado de forma segura desde middleware
    return this.analyticsService.getTenantDashboardMetrics(req.tenantId);
  }

  @Get('reports/sales')
  // @Roles('TENANT_ADMIN', 'SUPERADMIN')
  async getSalesReport(
    @Req() req: RequestWithTenant,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    const data = await this.analyticsService.getSalesExportData(req.tenantId, start, end);
    return { data, count: data.length };
  }
}
