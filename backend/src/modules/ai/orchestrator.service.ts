import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrchestratorService {
  constructor(private prisma: PrismaService) {}

  async createSession(tenantId: string, userId: string, title: string) {
    return this.prisma.aiSession.create({
      data: { tenantId, userId, title, messages: [] },
    });
  }

  async getSessions(tenantId: string, userId?: string) {
    return this.prisma.aiSession.findMany({
      where: { tenantId, ...(userId ? { userId } : {}) },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });
  }

  async getSession(id: string, tenantId: string) {
    return this.prisma.aiSession.findFirst({
      where: { id, tenantId },
    });
  }

  async updateSession(id: string, tenantId: string, messages: unknown[]) {
    return this.prisma.aiSession.update({
      where: { id },
      data: { messages },
    });
  }
}
