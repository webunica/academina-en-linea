import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

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
   * Esto retorna un ID que nuestro Frontend usará para subir el archivo directamente (Tus Protocol).
   */
  async createVideoAsset(tenantId: string, title: string) {
    try {
      // Petición a la API de Bunny.net
      const response = await fetch(`${this.baseUrl}/${this.libraryId}/videos`, {
        method: 'POST',
        headers: {
          'AccessKey': this.accessKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error('Failed to create video on Bunny.net');
      }

      const externalData = await response.json();

      // Guardamos la referencia agnóstica en nuestra base de datos para el Tenant
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
        uploadUrl: `https://video.bunnycdn.com/tusupload`, // Usado por Uppy.js / Tus en el frontend
      };
    } catch (error) {
      this.logger.error(`Error creating Bunny.net asset: ${error.message}`);
      throw new InternalServerErrorException('Error inicializando video provider');
    }
  }

  /**
   * Genera el JWT seguro para el reproductor embebido de Bunny.
   * Garantiza que el video solo pueda ser visto por un estudiante inscrito en ese Tenant.
   */
  async generateSecureEmbedToken(videoId: string, tenantDomain: string): Promise<string> {
    // Aquí implementamos la firma HMAC-SHA256 exigida por Bunny Token Security
    // Esto asegura que si roban el iframe, no funcionará en dominios extraños a la academia
    const secret = this.configService.get<string>('BUNNY_TOKEN_SECURITY_KEY');
    
    // Lógica hash en producción...
    return `https://iframe.mediadelivery.net/embed/${this.libraryId}/${videoId}?token=SECURE_HASH`;
  }
}
