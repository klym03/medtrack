import { IsInt, IsOptional, IsDateString, Min, Max } from 'class-validator';

export class UpdateBloodPressureDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(300)
  systolic?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(200)
  diastolic?: number;

  @IsOptional()
  @IsDateString()
  timestamp?: string;
} 