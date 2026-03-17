import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra a un estudiante en un curso específico.
   * Valida existencia mutua y evita duplicados.
   */
  async enrollStudent(tenantId: string, userId: string, courseId: string) {
    // 1. Asegurar que el usuario sea reconocido como Student en este Tenant
    let student = await this.prisma.student.findUnique({
      where: { tenantId_userId: { tenantId, userId } }
    });

    if (!student) {
      student = await this.prisma.student.create({
        data: { tenantId, userId }
      });
    }

    // 2. Crear el Enrollment
    return this.prisma.enrollment.upsert({
      where: {
        tenantId_studentId_courseId: {
          tenantId,
          studentId: student.id,
          courseId
        }
      },
      update: { status: 'ACTIVE' },
      create: {
        tenantId,
        studentId: student.id,
        courseId,
        status: 'ACTIVE',
      }
    });
  }

  /**
   * Obtener cursos en los que el alumno está inscrito.
   */
  async getStudentEnrollments(tenantId: string, userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { tenantId_userId: { tenantId, userId } }
    });
    if (!student) return [];

    return this.prisma.enrollment.findMany({
      where: { tenantId, studentId: student.id, status: 'ACTIVE' },
      include: { course: true }
    });
  }

  /**
   * Marca una lección como completada y recalcula el progreso del curso.
   */
  async completeLesson(tenantId: string, userId: string, lessonId: string) {
    const student = await this.prisma.student.findUnique({
      where: { tenantId_userId: { tenantId, userId } }
    });
    if (!student) throw new Error('Student not found');

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { section: true }
    });
    if (!lesson) throw new Error('Lesson not found');

    const courseId = lesson.section.courseId;

    // 1. Upsert LessonProgress
    await this.prisma.lessonProgress.upsert({
      where: { 
        tenantId_studentId_lessonId: { 
          tenantId, 
          studentId: student.id, 
          lessonId 
        } 
      },
      update: { isCompleted: true, completedAt: new Date() },
      create: { 
        tenantId, 
        studentId: student.id, 
        lessonId, 
        isCompleted: true, 
        completedAt: new Date() 
      }
    });

    // 2. Recalcular Progreso del Curso
    const totalLessons = await this.prisma.lesson.count({
      where: { section: { courseId } }
    });

    const completedLessons = await this.prisma.lessonProgress.count({
      where: { 
        studentId: student.id, 
        lesson: { section: { courseId } },
        isCompleted: true 
      }
    });

    const percent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return this.prisma.courseProgress.upsert({
      where: { 
        tenantId_studentId_courseId: { 
          tenantId, 
          studentId: student.id, 
          courseId 
        } 
      },
      update: { 
        percentComplete: percent, 
        isCompleted: percent >= 100,
        completedAt: percent >= 100 ? new Date() : null
      },
      create: {
        tenantId,
        studentId: student.id,
        courseId,
        percentComplete: percent,
        isCompleted: percent >= 100,
        completedAt: percent >= 100 ? new Date() : null
      }
    });
  }
}
