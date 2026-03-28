import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.client.findMany({
      where: { tenantId },
      include: { _count: { select: { cases: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string, tenantId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, tenantId },
      include: {
        cases: { select: { id: true, title: true, status: true } },
        _count: { select: { cases: true } },
      },
    });

    if (!client) {
      throw new NotFoundException(`Client ${id} not found`);
    }

    return client;
  }

  async create(tenantId: string, createdBy: string, data: { name: string; email?: string; phone?: string; company?: string; address?: string }) {
    return this.prisma.client.create({
      data: { tenantId, createdBy, ...data },
    });
  }

  async update(id: string, tenantId: string, data: Partial<{ name: string; email: string; phone: string; company: string; address: string; notes: string }>) {
    await this.findById(id, tenantId);
    return this.prisma.client.update({ where: { id }, data });
  }
}
