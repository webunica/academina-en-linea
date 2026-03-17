import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class BunnyService {
  private readonly logger = new Logger(BunnyService.name);
  private readonly libraryId: string;
  private readonly accessKey: string;
  private readonly baseUrl: string = 'https://video.bunnycdn.com/library';

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.libraryId = this.configService.get<string>('BUNNY_LIBRARY_ID');
    this.accessKey = this.configService.get<string>('BUNNY_API_KEY');
  }

  /**
   * 1. Solicita la pre-creación de un Video en Bunny.net.
   * Esto retorna un ID que nuestro Frontend usará para subir el archivo directamente.
   */
  async createVideoAsset(tenantId: string, title: string) {
    try {
      const response = await fetch(`${this.baseUrl}/${this.libraryId}/videos`, {
        method: 'POST',
        headers: {
          'AccessKey': this.accessKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        const err = await response.text();
        this.logger.error(`Bunny API error: ${err}`);
        throw new Error('Failed to create video on Bunny.net');
      }

      const externalData = await response.json();

      const dbAsset = await this.prisma.mediaAsset.create({
        data: {
          tenantId,
          provider: 'BUNNY_NET' as any,
          providerId: externalData.guid,
          filename: title,
          status: 'PROCESSING',
        },
      });

      return {
        bunnyVideoId: externalData.guid,
        mediaAssetId: dbAsset.id,
        libraryId: this.libraryId,
      };
    } catch (error) {
      this.logger.error(`Error creating Bunny.net asset: ${error.message}`);
      throw new InternalServerErrorException('Error inicializando video provider');
    }
  }

  /**
   * Genera el URL firmado para el reproductor embebido de Bunny.
   */
  async generateSecureEmbedUrl(videoId: string): Promise<string> {
    const securityKey = this.configService.get<string>('BUNNY_SECURITY_KEY');
    if (!securityKey) return `https://iframe.mediadelivery.net/embed/${this.libraryId}/${videoId}`;

    // Paso de tiempo: expira en 2 horas
    const expires = Math.floor(Date.now() / 1000) + (3600 * 2);
    
    // Algoritmo: SHA256(securityKey + videoId + expires)
    const token = crypto
      .createHash('sha256')
      .update(securityKey + videoId + expires.toString())
      .digest('hex');

    return `https://iframe.mediadelivery.net/embed/${this.libraryId}/${videoId}?token=${token}&expires=${expires}`;
  }
}
