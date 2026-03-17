import { Module } from '@nestjs/common';
import { BunnyService } from './bunny.service';
import { MediaController } from './media.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BunnyService],
  controllers: [MediaController],
  exports: [BunnyService],
})
export class MediaModule {}
