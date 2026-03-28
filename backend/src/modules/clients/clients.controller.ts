import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { TenantId, UserId } from '../../common/decorators/request.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('clients')
@ApiBearerAuth()
@Controller('clients')
@UseGuards(RolesGuard)
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all clients' })
  findAll(@TenantId() tenantId: string) {
    return this.clientsService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.clientsService.findById(id, tenantId);
  }

  @Post()
  @Roles('ADMIN', 'LAWYER', 'SECRETARY')
  @ApiOperation({ summary: 'Create new client' })
  create(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: { name: string; email?: string; phone?: string; company?: string },
  ) {
    return this.clientsService.create(tenantId, userId, dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'LAWYER', 'SECRETARY')
  @ApiOperation({ summary: 'Update client' })
  update(@Param('id') id: string, @TenantId() tenantId: string, @Body() dto: Partial<{ name: string; email: string; phone: string; notes: string }>) {
    return this.clientsService.update(id, tenantId, dto);
  }
}
