import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { HttpService } from '@nestjs/axios';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  sessionId?: string;
  context?: { caseId?: string; documentIds?: string[] };
}

export interface ChatResponse {
  message: string;
  sessionId: string;
  sources?: Array<{ documentId: string; content: string; score: number }>;
}

@Injectable()
export class AiService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.baseUrl = this.configService.get('ai.serviceUrl');
    this.apiKey = this.configService.get('ai.apiKey');
  }

  async chat(tenantId: string, request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await this.httpService.post<ChatResponse>(
        `${this.baseUrl}/api/chat`,
        { ...request, tenantId },
        {
          headers: {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      ).toPromise();

      return response?.data || { message: 'No response', sessionId: request.sessionId || '' };
    } catch (error) {
      throw new Error(`AI service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async summarizeCase(tenantId: string, caseId: string): Promise<string> {
    try {
      const response = await this.httpService.post<{ summary: string }>(
        `${this.baseUrl}/api/summarize/case`,
        { caseId, tenantId },
        {
          headers: {
            'X-API-Key': this.apiKey,
          },
        },
      ).toPromise();

      return response?.data?.summary || '';
    } catch (error) {
      throw new Error(`Summarization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyzeDocument(tenantId: string, documentId: string): Promise<Record<string, unknown>> {
    try {
      const response = await this.httpService.post<Record<string, unknown>>(
        `${this.baseUrl}/api/analyze/document`,
        { documentId, tenantId },
        {
          headers: {
            'X-API-Key': this.apiKey,
          },
        },
      ).toPromise();

      return response?.data || {};
    } catch (error) {
      throw new Error(`Document analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
