import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TimeEntriesService } from './time-entries.service';
import { TenantId, UserId } from '../../../common/decorators/request.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('billing')
@ApiBearerAuth()
@Controller('billing/time-entries')
@UseGuards(RolesGuard)
export class TimeEntriesController {
  constructor(private timeEntriesService: TimeEntriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get time entries' })
  findAll(@TenantId() tenantId: string, @Query('caseId') caseId?: string) {
    return this.timeEntriesService.findAll(tenantId, caseId);
  }

  @Post()
  @ApiOperation({ summary: 'Create time entry' })
  create(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: { caseId: string; description: string; hours: number; date: string },
  ) {
    return this.timeEntriesService.create(tenantId, userId, dto);
  }
}
