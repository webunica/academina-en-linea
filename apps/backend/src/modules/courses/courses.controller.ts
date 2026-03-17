import { Controller, Post, Get, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithTenant } from '../../common/interfaces/request-with-tenant.interface';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: RequestWithTenant, @Body() dto: CreateCourseDto) {
    return this.coursesService.createCourse(req.tenantId, dto);
  }

  @Get()
  async findAll(@Req() req: RequestWithTenant, @Query('public') isPublic: string) {
    return this.coursesService.getCoursesByTenant(req.tenantId, isPublic === 'true');
  }

  /**
   * Cursos del Alumno Logueado (Mis Cursos)
   */
  @Get('my-learning')
  @UseGuards(JwtAuthGuard)
  async getEnrolled(@Req() req: RequestWithTenant) {
    return this.coursesService.getEnrolledCourses(req.tenantId, (req.user as any).sub);
  }

  @Get(':slug')
  async findOne(@Req() req: RequestWithTenant, @Param('slug') slug: string) {
    return this.coursesService.getCourseBySlug(req.tenantId, slug);
  }

  /**
   * Currículum: Crear Sección
   */
  @Post(':id/sections')
  @UseGuards(JwtAuthGuard)
  async addSection(
    @Req() req: RequestWithTenant,
    @Param('id') courseId: string,
    @Body('title') title: string
  ) {
    return this.coursesService.createSection(req.tenantId, courseId, title);
  }

  /**
   * Currículum: Crear Lección
   */
  @Post('sections/:sectionId/lessons')
  @UseGuards(JwtAuthGuard)
  async addLesson(
    @Req() req: RequestWithTenant,
    @Param('sectionId') sectionId: string,
    @Body() body: { title: string, type: string }
  ) {
    return this.coursesService.createLesson(req.tenantId, sectionId, body);
  }
}
