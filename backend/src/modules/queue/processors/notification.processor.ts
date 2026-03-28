import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<{ userId: string; type: string; title: string; message: string }>): Promise<void> {
    const { userId, type, title, message } = job.data;

    await this.prisma.notification.create({
      data: {
        userId,
        type: type as 'CASE_UPDATE' | 'DOCUMENT_UPLOADED' | 'COURT_DATE_REMINDER' | 'INVOICE_PAID' | 'AI_RESPONSE' | 'SYSTEM',
        title,
        message,
      },
    });
  }
}
