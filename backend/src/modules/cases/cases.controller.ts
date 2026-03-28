import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CasesService } from './cases.service';
import { TenantId, UserId } from '../../common/decorators/request.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { CaseStatus } from '@prisma/client';

@ApiTags('cases')
@ApiBearerAuth()
@Controller('cases')
@UseGuards(RolesGuard)
export class CasesController {
  constructor(private casesService: CasesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all cases' })
  findAll(
    @TenantId() tenantId: string,
    @Query('status') status?: CaseStatus,
    @Query('clientId') clientId?: string,
  ) {
    return this.casesService.findAll(tenantId, { status, clientId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get case by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.casesService.findById(id, tenantId);
  }

  @Post()
  @Roles('ADMIN', 'LAWYER')
  @ApiOperation({ summary: 'Create new case' })
  create(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: CreateCaseDto,
  ) {
    return this.casesService.create(tenantId, userId, dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'LAWYER')
  @ApiOperation({ summary: 'Update case' })
  update(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() dto: UpdateCaseDto,
  ) {
    return this.casesService.update(id, tenantId, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete case' })
  delete(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.casesService.delete(id, tenantId);
  }

  @Post(':id/events')
  @Roles('ADMIN', 'LAWYER')
  @ApiOperation({ summary: 'Add case event' })
  addEvent(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() dto: { type: string; title: string; description?: string; eventDate: string },
  ) {
    return this.casesService.addEvent(id, tenantId, {
      ...dto,
      eventDate: new Date(dto.eventDate),
    });
  }
}
