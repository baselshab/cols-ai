import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CasesRepository } from './cases.repository';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { CaseStatus } from '@prisma/client';

@Injectable()
export class CasesService {
  constructor(private caseRepo: CasesRepository) {}

  async findAll(tenantId: string, filters?: { status?: CaseStatus; clientId?: string }) {
    const where: Record<string, unknown> = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.clientId) where.clientId = filters.clientId;

    return this.caseRepo.findMany(tenantId, where);
  }

  async findById(id: string, tenantId: string) {
    const caseData = await this.caseRepo.findOne(tenantId, id);
    if (!caseData) {
      throw new NotFoundException(`Case ${id} not found`);
    }
    return caseData;
  }

  async create(tenantId: string, lawyerId: string, dto: CreateCaseDto) {
    const existing = await this.caseRepo.count(tenantId, { caseNumber: dto.caseNumber });
    if (existing > 0) {
      throw new ConflictException(`Case number ${dto.caseNumber} already exists`);
    }

    return this.caseRepo.create({
      tenantId,
      lawyerId,
      caseNumber: dto.caseNumber,
      title: dto.title,
      type: dto.type,
      clientId: dto.clientId,
      courtDate: dto.courtDate ? new Date(dto.courtDate) : undefined,
      courtName: dto.courtName,
      description: dto.description,
    });
  }

  async update(id: string, tenantId: string, dto: UpdateCaseDto) {
    await this.findById(id, tenantId);

    const data: Record<string, unknown> = { ...dto };
    if (dto.courtDate) data.courtDate = new Date(dto.courtDate);
    if (dto.status === CaseStatus.CLOSED) data.closedAt = new Date();

    return this.caseRepo.update(id, tenantId, data);
  }

  async delete(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    return this.caseRepo.delete(id, tenantId);
  }

  async addEvent(caseId: string, tenantId: string, data: { type: string; title: string; description?: string; eventDate: Date }) {
    await this.findById(caseId, tenantId);

    return this.caseRepo.update(caseId, tenantId, {
      events: {
        create: {
          type: data.type,
          title: data.title,
          description: data.description,
          eventDate: data.eventDate,
        },
      },
    });
  }
}
