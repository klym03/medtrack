import { IsString, IsOptional, IsArray, ValidateNested, Length, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateIndicatorDto } from './create-indicator.dto'; // Припустимо, індикатори передаються так само

export class UpdateAnalysisDto {
  @IsString()
  @IsOptional()
  @Length(0, 255)
  filename?: string | null;

  @IsString()
  @IsOptional()
  @Length(0, 100)
  documentType?: string | null;

  @IsString()
  @IsOptional()
  @Length(0, 50)
  analysisDate?: string | null;

  @IsString()
  @IsOptional()
  rawResultText?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIndicatorDto) // Для оновлення, можливо, знадобиться UpdateIndicatorDto, але поки використовуємо Create
  @IsOptional()
  indicators?: CreateIndicatorDto[];

  @IsObject()
  @IsOptional()
  structuredReportData?: Record<string, any> | null;
} 