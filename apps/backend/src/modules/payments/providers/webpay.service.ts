import { Injectable } from '@nestjs/common';
import { PaymentGateway } from '../payment-router.service';

@Injectable()
export class WebpayService implements PaymentGateway {
  
  async createTransaction(amount: number, currency: string, metadata: any): Promise<any> {
    if (currency !== 'CLP') {
      throw new Error('Webpay solo opera transacciones en Pesos Chilenos (CLP).');
    }

    // Lógica Real Transbank SDK:
    // const tx = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));
    // const response = await tx.create(metadata.buyOrder, metadata.sessionId, amount, metadata.returnUrl);
    
    return {
      gatewayTransactionId: 'WPAY-MOCK-UUID',
      paymentUrl: 'https://webpay3gint.transbank.cl/webpayserver/initTransaction',
      // token: response.token
    };
  }

  async verifyTransaction(token: string): Promise<any> {
    // SDK: tx.commit(token)
    return {
      status: 'APPROVED',
      amount: 50000,
      authorizationCode: '123456',
    };
  }

  async refundTransaction(transactionId: string): Promise<boolean> {
    // SDK: tx.refund(token, amount)
    return true;
  }
}
