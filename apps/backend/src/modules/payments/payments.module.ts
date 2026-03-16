import { Module } from '@nestjs/common';
import { PaymentRouterService } from './payment-router.service';

@Module({
  providers: [PaymentRouterService],
  exports: [PaymentRouterService]
})
export class PaymentsModule {}
