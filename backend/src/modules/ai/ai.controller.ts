import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService, ChatRequest } from './ai.service';
import { OrchestratorService } from './orchestrator.service';
import { TenantId, UserId } from '../../common/decorators/request.decorator';
import { Throttle } from '../../common/decorators/throttle.decorator';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(
    private aiService: AiService,
    private orchestratorService: OrchestratorService,
  ) {}

  @Post('chat')
  @Throttle({ limit: 20, ttl: 60000 })
  @ApiOperation({ summary: 'Send chat message to AI' })
  async chat(
    @TenantId() tenantId: string,
    @Body() dto: ChatRequest,
  ) {
    const sessionId = dto.sessionId || `session-${Date.now()}`;
    return this.aiService.chat(tenantId, { ...dto, sessionId });
  }

  @Post('summarize/case/:caseId')
  @ApiOperation({ summary: 'Generate AI summary for a case' })
  async summarizeCase(
    @Param('caseId') caseId: string,
    @TenantId() tenantId: string,
  ) {
    const summary = await this.aiService.summarizeCase(tenantId, caseId);
    return { summary };
  }

  @Post('analyze/document/:documentId')
  @ApiOperation({ summary: 'Analyze a document with AI' })
  async analyzeDocument(
    @Param('documentId') documentId: string,
    @TenantId() tenantId: string,
  ) {
    return this.aiService.analyzeDocument(tenantId, documentId);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get AI chat sessions' })
  async getSessions(@TenantId() tenantId: string, @UserId() userId: string) {
    return this.orchestratorService.getSessions(tenantId, userId);
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get specific session' })
  async getSession(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.orchestratorService.getSession(id, tenantId);
  }

  @Post('sessions')
  @ApiOperation({ summary: 'Create new chat session' })
  async createSession(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: { title: string },
  ) {
    return this.orchestratorService.createSession(tenantId, userId, dto.title);
  }
}
