import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

// Bases
import { PrismaModule } from './prisma/prisma.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';

// Domain Modules
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EmailModule } from './modules/email/email.module';
import { MediaModule } from './modules/media/media.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    // Tipado seguro sobre .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // apuntará al que esté en la raíz de backend/
    }),

    // Redis queue system para asincronía (Webhooks, Emails)
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      },
    }),

    // Prisma DB Global
    PrismaModule,

    // Feature Modules (Fase 3 requerimientos)
    AuthModule,
    TenantsModule,
    UsersModule,
    RolesModule,
    CoursesModule,
    EnrollmentsModule,
    PaymentsModule,
    NotificationsModule,
    EmailModule,
    MediaModule,
    AnalyticsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Inyectar contexto del Tenant en TODAS las rutas de la API, 
    // excepto las puramente de SuperAdmin si decidimos separarlas.
    consumer
      .apply(TenantMiddleware)
      .forRoutes('*'); 
  }
}
