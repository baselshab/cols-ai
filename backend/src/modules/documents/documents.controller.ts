import { Controller, Get, Post, Delete, Param, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { TenantId } from '../../common/decorators/request.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
@UseGuards(RolesGuard)
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all documents' })
  findAll(@TenantId() tenantId: string, @Query('caseId') caseId?: string) {
    return this.documentsService.findAll(tenantId, caseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.documentsService.findById(id, tenantId);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get download URL' })
  getDownloadUrl(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.documentsService.getDownloadUrl(id, tenantId);
  }

  @Post('upload')
  @Roles('ADMIN', 'LAWYER', 'PARALEGAL', 'SECRETARY')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload document' })
  upload(
    @TenantId() tenantId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('caseId') caseId?: string,
  ) {
    return this.documentsService.upload(tenantId, file, caseId);
  }

  @Delete(':id')
  @Roles('ADMIN', 'LAWYER')
  @ApiOperation({ summary: 'Delete document' })
  delete(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.documentsService.delete(id, tenantId);
  }
}
