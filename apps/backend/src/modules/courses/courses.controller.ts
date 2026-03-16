import { Controller, Get, Post, Body, Param, Req, UseGuards, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { RequestWithTenant } from '../../common/interfaces/request-with-tenant.interface';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  // @UseGuards(JwtAuthGuard, RolesGuard) // Descomentar al integrar auth final
  async createCourse(
    @Req() req: RequestWithTenant,
    @Body() createCourseDto: CreateCourseDto,
  ) {
    // req.tenantId inyectado infaliblemente por el TenantMiddleware
    return this.coursesService.createCourse(req.tenantId, createCourseDto);
  }

  @Get()
  async getCourses(
    @Req() req: RequestWithTenant,
    @Query('public') isPublic: string,
  ) {
    const publishedOnly = isPublic === 'true';
    return this.coursesService.getCoursesByTenant(req.tenantId, publishedOnly);
  }

  @Get(':slug')
  async getCourseDetails(
    @Req() req: RequestWithTenant,
    @Param('slug') slug: string,
  ) {
    return this.coursesService.getCourseBySlug(req.tenantId, slug);
  }
}
