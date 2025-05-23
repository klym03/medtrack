import { IsOptional, IsString, IsUUID, IsDateString, IsArray, IsEnum, IsBoolean } from 'class-validator';
// import { DayOfWeek } from '@shared/models'; // Старий імпорт
import { DayOfWeek } from '@shared/models/medication-reminder.entity'; // <--- ЗМІНЕНО: Прямий імпорт

export class UpdateMedicationReminderDto {
  @IsOptional()
  @IsUUID()
  medicationId?: string;

  @IsOptional()
  @IsString() // Or IsDateString
  reminderTime?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(DayOfWeek, { each: true })
  daysOfWeek?: DayOfWeek[];

  @IsOptional()
  @IsDateString()
  specificDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
} 