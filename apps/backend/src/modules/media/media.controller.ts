import { Controller, Post, Body, UseGuards, Req, Param, Get } from '@nestjs/common';
import { BunnyService } from './bunny.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithTenant } from '../../common/interfaces/request-with-tenant.interface';

@Controller('media')
export class MediaController {
  constructor(private readonly bunnyService: BunnyService) {}

  /**
   * Reserva un ID de video en Bunny y lo registra en BD.
   * Retorna el ID para que el frontend suba el video.
   */
  @Post('init-video')
  @UseGuards(JwtAuthGuard)
  async initVideo(
    @Req() req: RequestWithTenant,
    @Body('title') title: string
  ) {
    return this.bunnyService.createVideoAsset(req.tenantId, title);
  }

  /**
   * Obtiene el URL firmado para reproducir el video de forma segura.
   */
  @Get('signed-url/:videoId')
  @UseGuards(JwtAuthGuard)
  async getSignedUrl(@Param('videoId') videoId: string) {
    const url = await this.bunnyService.generateSecureEmbedUrl(videoId);
    return { url };
  }
}
