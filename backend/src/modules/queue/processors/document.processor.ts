import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('document-processing')
export class DocumentProcessor extends WorkerHost {
  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<{ documentId: string; tenantId: string }>): Promise<void> {
    const { documentId, tenantId } = job.data;

    await this.prisma.document.update({
      where: { id: documentId },
      data: { status: 'PROCESSING' },
    });

    try {
      await this.prisma.document.update({
        where: { id: documentId },
        data: {
          status: 'PROCESSED',
          extractedText: 'Extracted text placeholder',
        },
      });
    } catch (error) {
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: 'FAILED' },
      });
    }
  }
}
