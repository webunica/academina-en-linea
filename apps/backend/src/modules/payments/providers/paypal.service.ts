import { Injectable } from '@nestjs/common';
import { PaymentGateway } from '../payment-router.service';

@Injectable()
export class PaypalService implements PaymentGateway {
  
  async createTransaction(amount: number, currency: string, metadata: any): Promise<any> {
    if (currency === 'CLP') {
      throw new Error('PayPal no soporta CLP. Procesando moneda extranjera.');
    }

    // PayPal REST API via Axios o SDK (OrdersCreateRequest)
    
    return {
      gatewayTransactionId: 'PAYPAL-ORDER-MOCK',
      paymentUrl: 'https://www.sandbox.paypal.com/checkoutnow?token=MOCK',
    };
  }

  async verifyTransaction(orderId: string): Promise<any> {
    // PayPal Capture Orders API
    return {
      status: 'APPROVED',
    };
  }

  async refundTransaction(transactionId: string): Promise<boolean> {
    return true;
  }
}
