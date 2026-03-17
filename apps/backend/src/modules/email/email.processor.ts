import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailJobPayload } from './email.service';
import * as nodemailer from 'nodemailer';

@Processor('email-sending')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly prisma: PrismaService,
    private configService: ConfigService
  ) {
    super();
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST') || 'localhost',
      port: this.configService.get<number>('SMTP_PORT', 1025),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
    });
  }

  async process(job: Job<EmailJobPayload, any, string>): Promise<any> {
    const { tenantId, to, templateName, variables } = job.data;
    
    try {
      this.logger.log(`Enviando email '${templateName}' a ${to}`);

      let html = '';
      let subject = '';

      if (templateName === 'welcome_tenant') {
        subject = `¡Bienvenido a Academina! - ${variables.academyName}`;
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee; border-radius: 20px;">
            <h1 style="color: #1a1a1a;">¡Hola ${variables.adminName}!</h1>
            <p style="color: #666; line-height: 1.6;">Tu academia <strong>${variables.academyName}</strong> ha sido creada con éxito.</p>
            <p style="color: #666;">Puedes acceder a tu panel de control aquí:</p>
            <a href="${variables.adminUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 20px 0;">Entrar al Administrador</a>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999;">Email enviado automáticamente por Academina SaaS.</p>
          </div>
        `;
      } else if (templateName === 'purchase_confirmation') {
         subject = `Confirmación de compra: ${variables.courseTitle}`;
         html = `<p>Gracias por tu compra del curso <b>${variables.courseTitle}</b>.</p>`;
      }

      await this.transporter.sendMail({
        from: `"Academina Platform" <${this.configService.get<string>('SMTP_USER') || 'no-reply@academina.cl'}>`,
        to,
        subject,
        html,
      });

      await this.prisma.emailLog.create({
        data: {
          tenantId,
          to,
          subject,
          status: 'SENT',
        }
      });

    } catch (error) {
      this.logger.error(`Error procesando email: ${error.message}`);
      await this.prisma.emailLog.create({
        data: {
          tenantId,
          to,
          subject: 'Error: ' + templateName,
          status: 'FAILED',
          error: error.message,
        }
      });
      throw error; 
    }
  }
}
