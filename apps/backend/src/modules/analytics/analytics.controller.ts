import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { RequestWithTenant } from '../../common/interfaces/request-with-tenant.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  async getDashboardMetrics(@Req() req: RequestWithTenant) {
    return this.analyticsService.getTenantDashboardMetrics(req.tenantId);
  }

  @Get('reports/sales')
  @UseGuards(JwtAuthGuard)
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
