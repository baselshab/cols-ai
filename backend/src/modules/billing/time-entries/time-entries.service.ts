import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TimeEntriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, caseId?: string) {
    return this.prisma.timeEntry.findMany({
      where: { tenantId, ...(caseId ? { caseId } : {}) },
      include: { user: { select: { name: true } }, case: { select: { title: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async create(
    tenantId: string,
    userId: string,
    dto: { caseId: string; description: string; hours: number; date: string; hourlyRate?: number },
  ) {
    const hourlyRate = dto.hourlyRate || 200;
    const amount = dto.hours * hourlyRate;

    return this.prisma.timeEntry.create({
      data: {
        tenantId,
        caseId: dto.caseId,
        userId,
        description: dto.description,
        hours: new Decimal(dto.hours),
        hourlyRate: new Decimal(hourlyRate),
        amount: new Decimal(amount),
        date: new Date(dto.date),
      },
    });
  }
}
