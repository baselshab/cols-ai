import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { S3Service } from './s3.service';
import { sanitizeFilename } from '../../common/utils';
import { randomBytes } from 'crypto';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  async findAll(tenantId: string, caseId?: string) {
    return this.prisma.document.findMany({
      where: { tenantId, ...(caseId ? { caseId } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, tenantId: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id, tenantId },
      include: { embeddings: { take: 10 } },
    });

    if (!doc) {
      throw new NotFoundException(`Document ${id} not found`);
    }

    return doc;
  }

  async upload(
    tenantId: string,
    file: Express.Multer.File,
    caseId?: string,
  ) {
    const ext = file.originalname.split('.').pop();
    const key = `documents/${tenantId}/${randomBytes(16).toString('hex')}.${ext}`;

    await this.s3Service.upload(key, file.buffer, file.mimetype);

    return this.prisma.document.create({
      data: {
        tenantId,
        caseId,
        name: sanitizeFilename(file.originalname),
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        s3Key: key,
        status: 'PENDING',
      },
    });
  }

  async delete(id: string, tenantId: string) {
    const doc = await this.findById(id, tenantId);
    await this.s3Service.delete(doc.s3Key);

    return this.prisma.document.delete({ where: { id } });
  }

  async getDownloadUrl(id: string, tenantId: string) {
    const doc = await this.findById(id, tenantId);
    return this.s3Service.getSignedUrl(doc.s3Key);
  }
}
