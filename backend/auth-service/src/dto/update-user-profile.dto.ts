import { IsOptional, IsString, IsISO8601, IsIn, IsNumber, Min, Max } from 'class-validator';

// Можливі значення для статі та статусу куріння, якщо ви хочете їх обмежити
// enum UserSex { MALE = 'male', FEMALE = 'female', OTHER = 'other' }
// enum SmokerStatus { YES = 'yes', NO = 'no', STOPPED = 'stopped' }

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsISO8601()
  dateOfBirth?: string; // YYYY-MM-DD

  @IsOptional()
  @IsIn(['Male', 'Female', 'Other', 'PreferNotToSay'])
  sex?: 'Male' | 'Female' | 'Other' | 'PreferNotToSay';

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

  // Added other fields from UserEntity that might be relevant for a profile update
  @IsOptional()
  @IsNumber()
  @Min(50) // Припустимі значення для систолічного тиску
  @Max(300)
  usualSystolic?: number;

  @IsOptional()
  @IsNumber()
  @Min(30) // Припустимі значення для діастолічного тиску
  @Max(200)
  usualDiastolic?: number;

  @IsOptional()
  isSmoker?: boolean;

  @IsOptional()
  @IsString()
  chronicConditions?: string; // Could be a comma-separated list or JSON string

  @IsOptional()
  @IsString()
  currentMedications?: string; // Could be a comma-separated list or JSON string
} 