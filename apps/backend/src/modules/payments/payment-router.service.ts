import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MercadoPagoService } from './providers/mercadopago.service';
import { WebpayService } from './providers/webpay.service';
import { PaypalService } from './providers/paypal.service';
import { GatewayType } from '@prisma/client';

export interface PaymentGateway {
  createTransaction(amount: number, currency: string, metadata: any): Promise<any>;
  verifyTransaction(transactionId: string): Promise<any>;
  refundTransaction(transactionId: string): Promise<boolean>;
}

@Injectable()
export class PaymentRouterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mpService: MercadoPagoService,
    private readonly wpayService: WebpayService,
    private readonly paypalService: PaypalService,
  ) {}

  /**
   * Enrutamiento de Negocio: Decide la pasarela a utilizar y la instancia temporalmente
   * o devuelve un Factory basado en el ENUM de base de datos.
   */
  async resolveGatewaysForTenantOrder(tenantId: string, currency: string, buyerCountryCode: string) {
    const activeSettings = await this.prisma.tenantPaymentSetting.findMany({
      where: { tenantId, isActive: true },
    });

    const activeGateways = activeSettings.map(s => s.gateway);
    const availableOptions = [];

    // Lógica de Enrutamiento de Negocio
    if (currency === 'CLP' && buyerCountryCode === 'CL') {
      // Tráfico Local Chileno
      if (activeGateways.includes('WEBPAY')) availableOptions.push('WEBPAY');
      if (activeGateways.includes('MERCADOPAGO')) availableOptions.push('MERCADOPAGO');
    } else {
      // Tráfico Internacional (Moneda extranjera o comprador de afuera)
      if (activeGateways.includes('PAYPAL')) availableOptions.push('PAYPAL');
      // Podríamos permitir Stripe aquí a futuro
    }

    return availableOptions;
  }

  async processWebhook(gateway: string, payload: any) {
    // Guarda inmediatamente la notificación en crudo para idempotencia en DB
    const log = await this.prisma.paymentWebhookLog.create({
      data: {
        gateway: gateway as any,
        payload: payload,
        isProcessed: false,
      }
    });

    // Envía ID a BullMQ para procesarlo asíncronamente libre de timeouts:
    // queue.add('process-payment', { logId: log.id })
    return { received: true, logId: log.id };
  }

  /**
   * Dispara el flujo de pago hacia el Gateway concreto.
   */
  async createPayment(gateway: GatewayType, data: { transactionId: string, amount: number, currency: string, description: string, returnUrl: string }) {
    const provider = this.getProvider(gateway);
    return provider.createTransaction(data.amount, data.currency, {
      buyOrder: data.transactionId,
      sessionId: `SESSION-${data.transactionId}`,
      returnUrl: data.returnUrl,
      description: data.description,
    });
  }

  private getProvider(gateway: GatewayType): PaymentGateway {
    switch (gateway) {
      case GatewayType.MERCADOPAGO: return this.mpService;
      case GatewayType.WEBPAY: return this.wpayService;
      case GatewayType.PAYPAL: return this.paypalService;
      default: throw new InternalServerErrorException('Gateway no soportado o inactivo.');
    }
  }
}
