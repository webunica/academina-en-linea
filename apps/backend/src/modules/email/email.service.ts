import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface EmailJobPayload {
  tenantId: string | null; // null si es email global de plataforma
  to: string;
  templateName: string; // ej: 'welcome_email', 'invoice_receipt'
  variables: Record<string, any>; // Nombres, links de acceso, valores de moneda
}

@Injectable()
export class EmailService {
  constructor(
    @InjectQueue('email-sending') private readonly emailQueue: Queue,
  ) {}

  /**
   * Encola el correo inmediatamente, retornando rápido al Controller
   * liberando el proceso HTTP (Altamente performante para webhooks SaaS).
   */
  async sendTransactionalEmail(payload: EmailJobPayload) {
    await this.emailQueue.add('send-email', payload, {
      attempts: 3, // Retry logic robusto si hay caídas SMTP
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
    });
    
    return { queued: true };
  }
}
