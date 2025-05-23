import { IsInt, IsOptional, IsDateString, Min, Max } from 'class-validator';

export class CreateBloodPressureDto {
  @IsInt()
  @Min(0)
  @Max(300) // Realistic upper limit for systolic
  systolic: number;

  @IsInt()
  @Min(0)
  @Max(200) // Realistic upper limit for diastolic
  diastolic: number;

  @IsOptional()
  @IsDateString()
  timestamp?: string; // Or Date, if transformation is handled
} 