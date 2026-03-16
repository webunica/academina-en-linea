import { Injectable } from '@nestjs/common';
import { PaymentGateway } from '../payment-router.service';

@Injectable()
export class MercadoPagoService implements PaymentGateway {
  // Inicialización de SDK MercadoPagoConfig...

  async createTransaction(amount: number, currency: string, metadata: any): Promise<any> {
    if (currency !== 'CLP') {
      throw new Error('MercadoPago configurado para cuentas chilenas (CLP).');
    }

    // SDK: const preference = new Preference(client);
    // const res = await preference.create({ body: { items: [...], back_urls: {...} } });

    return {
      gatewayTransactionId: 'MP-MOCK-ID',
      paymentUrl: 'https://www.mercadopago.cl/checkout/v1/redirect?pref_id=MOCK',
    };
  }

  async verifyTransaction(paymentId: string): Promise<any> {
    // SDK: const payment = new Payment(client);
    // const res = await payment.get({ id: paymentId });
    return {
      status: 'APPROVED',
    };
  }

  async refundTransaction(transactionId: string): Promise<boolean> {
    // Lógica para Reembolso MP
    return true;
  }
}
