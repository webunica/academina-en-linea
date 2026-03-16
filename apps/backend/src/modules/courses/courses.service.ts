import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un nuevo curso asegurando que pertenezca al Tenant actual.
   * Evita duplicidad de Slugs dentro del mismo Tenant.
   */
  async createCourse(tenantId: string, createCourseDto: CreateCourseDto) {
    // 1. Verificar colisión de slug (URL amigable)
    const existingCourse = await this.prisma.course.findUnique({
      where: {
        tenantId_slug: { tenantId, slug: createCourseDto.slug },
      },
      select: { id: true },
    });

    if (existingCourse) {
      throw new ConflictException(`El slug '${createCourseDto.slug}' ya está en uso en esta Academia.`);
    }

    // 2. Creación Inyectando Seguridad Multi-Tenant
    return this.prisma.course.create({
      data: {
        tenantId, // FUNDAMENTAL: Aislación obligatoria
        title: createCourseDto.title,
        slug: createCourseDto.slug,
        description: createCourseDto.description,
        price: createCourseDto.price ?? 0,
        currency: createCourseDto.currency ?? 'CLP',
        level: createCourseDto.level ?? 'ALL_LEVELS',
        status: createCourseDto.status ?? 'DRAFT',
        instructorId: createCourseDto.instructorId,
      },
    });
  }

  /**
   * Lista todos los cursos de esta academia. Si req es de un publico, filtramos a PUBLISHED.
   * Si es Academy Admin, puede verlos todos (esto se rige por param de API).
   */
  async getCoursesByTenant(tenantId: string, publishedOnly: boolean = false) {
    return this.prisma.course.findMany({
      where: {
        tenantId,
        ...(publishedOnly ? { status: 'PUBLISHED' } : {}),
        deletedAt: null, // Soft deletes
      },
      include: {
        instructor: { 
          include: { user: { select: { profile: true } } }
        },
        _count: { select: { sections: true, enrollments: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Detalle individual asegurando que no se pueda leer un curso de OTRA academia (gracias a tenantId global).
   */
  async getCourseBySlug(tenantId: string, slug: string) {
    const course = await this.prisma.course.findUnique({
      where: {
        tenantId_slug: { tenantId, slug },
      },
      include: {
        sections: {
          include: {
            lessons: { orderBy: { order: 'asc' } }
          },
          orderBy: { order: 'asc' }
        },
      }
    });

    if (!course || course.deletedAt) {
      throw new NotFoundException('Curso no encontrado');
    }

    return course;
  }
}
