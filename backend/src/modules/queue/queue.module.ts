import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';
import { QueueModule } from './queue.module';
import { DocumentProcessor } from './processors/document.processor';
import { NotificationProcessor } from './processors/notification.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: 'localhost',
          port: 6379,
          password: configService.get('redis.password'),
        },
      }),
    }),
    BullModule.registerQueue(
      { name: 'document-processing' },
      { name: 'notifications' },
    ),
  ],
  providers: [DocumentProcessor, NotificationProcessor],
  exports: [QueueModule],
})
export class QueueModule {}
