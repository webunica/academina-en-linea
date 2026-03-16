import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene las métricas generales del Dashboard del Academy Admin.
   * Filtra estrictamente por el `tenantId` inyectado por el Middleware de seguridad.
   */
  async getTenantDashboardMetrics(tenantId: string) {
    try {
      // 1. Total Studiantes Activos en este Tenant
      const totalStudents = await this.prisma.student.count({
        where: { tenantId }
      });

      // 2. Total de Cursos Publicados
      const totalCourses = await this.prisma.course.count({
        where: { tenantId, status: 'PUBLISHED' }
      });

      // 3. Ventas Brutas Totales (Solo Pagos Aprobados)
      const salesAggregate = await this.prisma.paymentTransaction.aggregate({
        _sum: { amount: true },
        where: { tenantId, status: 'APPROVED' }
      });

      // 4. Última Transacción Registrada
      const latestTransaction = await this.prisma.paymentTransaction.findFirst({
        where: { tenantId, status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        select: {
          amount: true,
          currency: true,
          gateway: true,
          createdAt: true
        }
      });

      return {
        activeStudents: totalStudents,
        publishedCourses: totalCourses,
        grossSales: salesAggregate._sum.amount || 0,
        latestTransaction: latestTransaction || null,
      };

    } catch (error) {
      this.logger.error(`Error calculando métricas para Tenant ${tenantId}: ${error.message}`);
      throw new Error('No se pudieron calcular las métricas del dashboard');
    }
  }

  /**
   * Genera el reporte crudo para ser exportado a CSV/Excel desde el Frontend.
   */
  async getSalesExportData(tenantId: string, startDate: Date, endDate: Date) {
    return this.prisma.paymentTransaction.findMany({
      where: {
        tenantId,
        status: 'APPROVED',
        createdAt: {
          gte: startDate,
          lte: endDate,
        }
      },
      select: {
        id: true,
        amount: true,
        currency: true,
        gateway: true,
        gatewayTransactionId: true,
        createdAt: true,
        user: { select: { email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
