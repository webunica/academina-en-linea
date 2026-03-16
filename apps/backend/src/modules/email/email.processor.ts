import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailJobPayload } from './email.service';
// import * as nodemailer from 'nodemailer'; // (Dependencia a instalar)

@Processor('email-sending')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<EmailJobPayload, any, string>): Promise<any> {
    const { tenantId, to, templateName, variables } = job.data;
    
    try {
      this.logger.log(`Procesando email '${templateName}' para ${to} [Tenant: ${tenantId || 'SaaS'}]`);

      // 1. Fetch Tenant SMTP Settings si es que tiene uno propio, sino usar SaaS global
      // const smtpConfig = await this.prisma.tenantSetting.findUnique(...)
      
      // 2. Mock de Nodemailer Transport
      // const transporter = nodemailer.createTransport({ host: smtpConfig.host... })

      // 3. Compilar el HTML del Template con las `variables` 
      // ...

      // 4. Enviar
      // await transporter.sendMail({ from: '...', to, subject: '...', html: compiledHtml });

      // 5. Dejar registro auditoría
      await this.prisma.emailLog.create({
        data: {
          tenantId,
          to,
          subject: 'Template: ' + templateName,
          status: 'SENT',
        }
      });

      this.logger.log(`Email '${templateName}' enviado con éxito a ${to}`);
    } catch (error) {
      this.logger.error(`Error procesando email: ${error.message}`);
      
      // Grabar fallo de forma que se pueda monitorear/analizar en BD
      await this.prisma.emailLog.create({
        data: {
          tenantId,
          to,
          subject: 'Template: ' + templateName,
          status: 'FAILED',
          error: error.message,
        }
      });

      // Lanza error para que BullMQ repita el job (retry config)
      throw error; 
    }
  }
}
