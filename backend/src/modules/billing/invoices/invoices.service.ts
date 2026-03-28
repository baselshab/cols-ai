import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, clientId?: string) {
    return this.prisma.invoice.findMany({
      where: { tenantId, ...(clientId ? { clientId } : {}) },
      include: { client: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, tenantId: string) {
    return this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: { client: true },
    });
  }

  async create(tenantId: string, dto: { clientId: string; dueDate: string; notes?: string }) {
    const count = await this.prisma.invoice.count({ where: { tenantId } });
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    return this.prisma.invoice.create({
      data: {
        tenantId,
        clientId: dto.clientId,
        invoiceNumber,
        dueDate: new Date(dto.dueDate),
        notes: dto.notes,
        subtotal: 0,
        total: 0,
      },
    });
  }
}
