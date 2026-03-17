import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentRouterService } from './payment-router.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { WebpayService } from './providers/webpay.service';
import { MercadoPagoService } from './providers/mercadopago.service';
import { PaypalService } from './providers/paypal.service';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentsController],
  providers: [
    PaymentRouterService,
    WebpayService,
    MercadoPagoService,
    PaypalService
  ],
  exports: [PaymentRouterService],
})
export class PaymentsModule {}
