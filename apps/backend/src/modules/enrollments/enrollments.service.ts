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
}
