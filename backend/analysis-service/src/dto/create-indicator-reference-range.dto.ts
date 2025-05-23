import { IsString, IsOptional, IsEnum, IsInt, IsNumber, Min, ValidateIf, IsNotEmpty } from 'class-validator';
import { SexConstraint } from '@shared/models';

export class CreateIndicatorReferenceRangeDto {
  @IsNotEmpty()
  @IsString()
  indicatorName: string;

  @IsNotEmpty()
  @IsString()
  units: string;

  @IsOptional()
  @IsEnum(SexConstraint)
  sexConstraint?: SexConstraint = SexConstraint.ANY;

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
  // TODO: Consider adding @ValidateIf if normalHigh must be gte normalLow
  normalHigh?: number | null;

  @IsOptional()
  @IsString()
  textualRange?: string | null;

  @IsOptional()
  @IsString()
  source?: string | null;
} 