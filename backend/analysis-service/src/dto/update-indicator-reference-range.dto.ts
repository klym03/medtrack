import { IsString, IsOptional, IsEnum, IsInt, IsNumber, Min } from 'class-validator';
import { SexConstraint } from '@shared/models';

export class UpdateIndicatorReferenceRangeDto {
  @IsOptional()
  @IsString()
  indicatorName?: string;

  @IsOptional()
  @IsString()
  units?: string;

  @IsOptional()
  @IsEnum(SexConstraint)
  sexConstraint?: SexConstraint;

  @IsOptional()
  @IsInt()
  @Min(0)
  ageMinYears?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  ageMaxYears?: number | null;

  @IsOptional()
  @IsNumber()
  normalLow?: number | null;

  @IsOptional()
  @IsNumber()
  normalHigh?: number | null;

  @IsOptional()
  @IsString()
  textualRange?: string | null;

  @IsOptional()
  @IsString()
  source?: string | null;
} 