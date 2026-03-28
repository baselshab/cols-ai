import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { OrchestratorService } from './orchestrator.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '../../config/config.module';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [AiController],
  providers: [AiService, OrchestratorService],
  exports: [AiService],
})
export class AiModule {}
