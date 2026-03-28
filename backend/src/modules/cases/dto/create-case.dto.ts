import { IsString, IsNotEmpty, IsEnum, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CaseType, CaseStatus } from '../../../prisma/schema';

export class CreateCaseDto {
  @ApiProperty({ example: 'CASE-2024-001' })
  @IsString()
  @IsNotEmpty()
  caseNumber: string;

  @ApiProperty({ example: 'Smith v. Johnson' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ enum: CaseType })
  @IsEnum(CaseType)
  type: CaseType;

  @ApiProperty()
  @IsUUID()
  clientId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  courtDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  courtName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCaseDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ enum: CaseStatus, required: false })
  @IsOptional()
  @IsEnum(CaseStatus)
  status?: CaseStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  courtDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  courtName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  aiSummary?: string;
}
