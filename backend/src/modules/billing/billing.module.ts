import { Module } from '@nestjs/common';
import { BillingModule } from './billing.module';
import { InvoicesController } from './invoices/invoices.controller';
import { InvoicesService } from './invoices/invoices.service';
import { TimeEntriesController } from './time-entries/time-entries.controller';
import { TimeEntriesService } from './time-entries/time-entries.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InvoicesController, TimeEntriesController],
  providers: [InvoicesService, TimeEntriesService],
  exports: [InvoicesService, TimeEntriesService],
})
export class BillingModule {}
