import { Controller, Post, Body, UseGuards, Req, Query, Get, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithTenant } from '../../common/interfaces/request-with-tenant.interface';
import { PaymentRouterService } from './payment-router.service';
import { PrismaService } from '../../prisma/prisma.service';
import { GatewayType } from '@prisma/client';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentRouter: PaymentRouterService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Inicia el flujo de pago con el gateway seleccionado.
   * Retorna la URL de redirección del proveedor (Ej: MercadoPago Checkouts o Formulario Webpay).
   */
  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  async initiatePayment(
    @Req() req: RequestWithTenant,
    @Body('courseId') courseId: string,
    @Body('gateway') gateway: GatewayType,
  ) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId, tenantId: req.tenantId },
    });

    if (!course) throw new Error('Curso no encontrado');

    // 1. Crear Orden de Pago en Base de Datos (Pending)
    const transaction = await this.prisma.paymentTransaction.create({
      data: {
        tenantId: req.tenantId,
        gateway,
        userId: (req.user as any).sub,
        amount: course.price,
        currency: course.currency,
        status: 'PENDING',
      }
    });

    // 2. Ejecutar Router dinámico hacia el proveedor real
    return this.paymentRouter.createPayment(gateway, {
      transactionId: transaction.id,
      amount: course.price,
      currency: course.currency,
      description: `Compra de: ${course.title}`,
      returnUrl: `http://${req.tenantSlug}.localhost:3000/checkout/success?order=${transaction.id}`,
    });
  }

  /**
   * Webhooks genéricos para capturar confirmaciones asincrónicas de los bancos.
   */
  @Post('webhook/:gateway')
  async handleWebhook(
    @Param('gateway') gateway: string,
    @Body() payload: any
  ) {
    // Registro de logs para auditoría de dinero
    await this.prisma.paymentWebhookLog.create({
      data: {
        gateway: gateway.toUpperCase() as any,
        payload
      }
    });

    // Lógica de procesamiento según el gateway (MercadoPago ID, Webpay Token, etc.)
    return { status: 'received' };
  }
}
