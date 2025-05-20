import { IsString, IsOptional, IsDateString, IsEnum, IsNumber, IsBoolean, Min, Max, Length } from 'class-validator';

// Можливі значення для статі та статусу куріння, якщо ви хочете їх обмежити
// enum UserSex { MALE = 'male', FEMALE = 'female', OTHER = 'other' }
// enum SmokerStatus { YES = 'yes', NO = 'no', STOPPED = 'stopped' }

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string; // Зберігаємо як рядок YYYY-MM-DD для простоти валідації

  @IsOptional()
  @IsString()
  // @IsEnum(UserSex) // Розкоментуйте, якщо хочете використовувати enum
  sex?: string; 

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(300)
  heightCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  weightKg?: number;

  @IsOptional()
  @IsString()
  // @IsEnum(SmokerStatus) // Розкоментуйте, якщо хочете використовувати enum
  isSmoker?: string;

  @IsOptional()
  @IsString()
  chronicConditions?: string;

  @IsOptional()
  @IsString()
  currentMedications?: string;

  @IsOptional()
  @IsBoolean()
  profileComplete?: boolean; // Зазвичай це поле встановлюється сервером, але може бути опція для користувача

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(300)
  usualSystolic?: number;

  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(200)
  usualDiastolic?: number;
} 