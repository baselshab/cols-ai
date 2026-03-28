import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CasesRepository {
  constructor(private prisma: PrismaService) {}

  findMany(tenantId: string, where?: Prisma.CaseWhereInput) {
    return this.prisma.case.findMany({
      where: { tenantId, ...where },
      include: {
        client: { select: { id: true, name: true, email: true } },
        lawyer: { select: { id: true, name: true } },
        _count: { select: { documents: true, timeEntries: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  findOne(tenantId: string, id: string) {
    return this.prisma.case.findFirst({
      where: { id, tenantId },
      include: {
        client: true,
        lawyer: { select: { id: true, name: true, email: true } },
        events: { orderBy: { eventDate: 'desc' } },
        documents: { select: { id: true, name: true, status: true, createdAt: true } },
        timeEntries: { include: { user: { select: { name: true } } } },
      },
    });
  }

  create(data: Prisma.CaseCreateInput) {
    return this.prisma.case.create({ data });
  }

  update(id: string, tenantId: string, data: Prisma.CaseUpdateInput) {
    return this.prisma.case.update({
      where: { id },
      data,
    });
  }

  delete(id: string, tenantId: string) {
    return this.prisma.case.delete({ where: { id } });
  }

  count(tenantId: string, where?: Prisma.CaseWhereInput) {
    return this.prisma.case.count({ where: { tenantId, ...where } });
  }
}
