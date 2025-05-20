import { IsString, IsOptional, IsArray, ValidateNested, IsDateString, Length, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateIndicatorDto } from './create-indicator.dto';

export class CreateAnalysisDto {
  @IsString()
  @IsOptional()
  @Length(0, 255)
  filename?: string | null;

  @IsString()
  @IsOptional()
  @Length(0, 100)
  documentType?: string | null;

  // Валідація формату дати, якщо потрібно (напр. YYYY-MM-DD)
  // @IsDateString()
  @IsString() // Поки що залишаємо як рядок, як в моделі
  @IsOptional()
  @Length(0, 50)
  analysisDate?: string | null;

  @IsString()
  @IsOptional()
  rawResultText?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIndicatorDto)
  @IsOptional() // Аналіз може бути створений без показників спочатку
  indicators?: CreateIndicatorDto[];

  @IsObject()
  @IsOptional()
  structuredReportData?: Record<string, any> | null;
} 