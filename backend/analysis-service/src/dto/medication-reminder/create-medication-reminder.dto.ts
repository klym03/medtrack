import { IsNotEmpty, IsString, IsUUID, IsDateString, IsOptional, IsArray, IsEnum, IsBoolean } from 'class-validator';
// import { DayOfWeek } from '@shared/models'; // Старий імпорт
import { DayOfWeek } from '@shared/models/medication-reminder.entity'; // <--- ВИПРАВЛЕНО ЩЕ РАЗ: Прямий імпорт

export class CreateMedicationReminderDto {
  @IsNotEmpty()
  @IsUUID()
  medicationId: string;

  @IsNotEmpty()
  @IsString() // Or IsDateString if you expect a specific ISO format string
  reminderTime: string; // e.g., "10:00", "14:30:00" or full ISO date with time

  @IsOptional()
  @IsArray()
  @IsEnum(DayOfWeek, { each: true })
  daysOfWeek?: DayOfWeek[]; // e.g., [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY]

  @IsOptional()
  @IsDateString()
  specificDate?: string; // ISO Date string if it's a one-time reminder

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
} 