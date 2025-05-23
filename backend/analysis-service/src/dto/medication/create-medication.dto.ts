import { IsString, IsOptional, IsDateString, IsUUID, Length, MaxLength } from 'class-validator';

export class CreateMedicationDto {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  dosage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  frequency?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string; // Or Date, if transformation is handled

  @IsOptional()
  @IsDateString()
  endDate?: string;   // Or Date

  @IsOptional()
  @IsString()
  notes?: string;
} 