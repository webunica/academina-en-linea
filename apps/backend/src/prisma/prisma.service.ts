import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      // Habilitar logs en dev para evaluar consultas en terminal
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * UTILIDAD MULTI-TENANT: 
   * Permite inyectar el client pre-filtrado si optamos por Prisma Client Extensions a futuro,
   * o manejar limpiezas específicas (soft deletes automáticos aplicados a nivel global).
   */
}
