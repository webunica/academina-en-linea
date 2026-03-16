import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    // Cola asíncrona para envíos SMTP desvinculados del tiempo de respuesta HTTP de la API
    BullModule.registerQueue({
      name: 'email-sending',
    }),
  ],
  providers: [], // Aquí irán EmailService, EmailConsumer (Processor)
  exports: [BullModule],
})
export class EmailModule {}
