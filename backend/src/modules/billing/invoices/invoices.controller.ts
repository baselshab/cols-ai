import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { TenantId } from '../../../common/decorators/request.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('billing')
@ApiBearerAuth()
@Controller('billing/invoices')
@UseGuards(RolesGuard)
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all invoices' })
  findAll(@TenantId() tenantId: string, @Query('clientId') clientId?: string) {
    return this.invoicesService.findAll(tenantId, clientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.invoicesService.findById(id, tenantId);
  }

  @Post()
  @Roles('ADMIN', 'LAWYER')
  @ApiOperation({ summary: 'Create invoice' })
  create(@TenantId() tenantId: string, @Body() dto: { clientId: string; dueDate: string; notes?: string }) {
    return this.invoicesService.create(tenantId, dto);
  }
}
