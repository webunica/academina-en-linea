import { Controller, Post, Param, UseGuards, Req } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithTenant } from '../../common/interfaces/request-with-tenant.interface';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post('lessons/:lessonId/complete')
  @UseGuards(JwtAuthGuard)
  async completeLesson(
    @Req() req: RequestWithTenant,
    @Param('lessonId') lessonId: string
  ) {
    return this.enrollmentsService.completeLesson(req.tenantId, (req.user as any).sub, lessonId);
  }
}
