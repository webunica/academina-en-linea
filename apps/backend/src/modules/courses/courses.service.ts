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
        } as any,
        _count: { select: { sections: true, enrollments: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtener cursos en los que el usuario está inscrito
   */
  async getEnrolledCourses(tenantId: string, userId: string) {
    // 1. Encontrar el registro de Estudiante para este usuario en este tenant
    const student = await this.prisma.student.findUnique({
      where: { tenantId_userId: { tenantId, userId } }
    });

    if (!student) return [];

    // 2. Buscar enrollments activos
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        tenantId,
        studentId: student.id,
        status: 'ACTIVE'
      },
      include: {
        course: {
          include: {
            instructor: { select: { user: { select: { profile: true } } } } as any,
            _count: { select: { sections: true } },
            progress: {
              where: { studentId: student.id }
            }
          }
        }
      }
    });

    return (enrollments as any[]).map(e => {
      const course = e.course;
      const progress = course.progress?.[0] || null;
      return {
        ...course,
        progress
      };
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

  /**
   * Detalle individual para el Editor (por ID).
   */
  async getCourseById(tenantId: string, id: string) {
    const course = await this.prisma.course.findUnique({
      where: {
        id,
        tenantId,
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

  /**
   * Secciones de Currículum
   */
  async createSection(tenantId: string, courseId: string, title: string) {
    // Validar que el curso existe y pertenece al tenant
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, tenantId }
    });
    if (!course) throw new NotFoundException('Curso no encontrado');

    const count = await this.prisma.courseSection.count({ where: { courseId } });

    return this.prisma.courseSection.create({
      data: {
        tenantId,
        courseId,
        title,
        order: count + 1,
      }
    });
  }

  /**
   * Lecciones de Currículum
   */
  async createLesson(tenantId: string, sectionId: string, data: { title: string, type: any }) {
    const section = await this.prisma.courseSection.findFirst({
      where: { id: sectionId, tenantId }
    });
    if (!section) throw new NotFoundException('Sección no encontrada');

    const count = await this.prisma.lesson.count({ where: { sectionId } });

    return this.prisma.lesson.create({
      data: {
        tenantId,
        sectionId,
        title: data.title,
        type: data.type,
        order: count + 1,
      }
    });
  }

  async updateLesson(tenantId: string, lessonId: string, data: any) {
    // Validar propiedad del tenant
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId, tenantId }
    });
    if (!lesson) throw new NotFoundException('Lección no encontrada');

    let videoAssetId = lesson.videoAssetId;

    // Si recibimos un bunnyVideoId, buscamos su MediaAsset ID en nuestra BD
    if (data.bunnyVideoId) {
      const asset = await this.prisma.mediaAsset.findFirst({
        where: { tenantId, providerId: data.bunnyVideoId }
      });
      if (asset) {
        videoAssetId = asset.id;
      }
    }

    return (this.prisma.lesson as any).update({
      where: { id: lessonId },
      data: {
        title: data.title,
        content: data.content,
        videoAssetId: videoAssetId,
        durationSec: data.durationSec,
        isFreePreview: data.isFreePreview
      }
    });
  }
}
