import { IsEmail, IsString, MinLength, IsOptional, IsDateString, IsEnum, IsNumber, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  sex?: string;

  @IsNumber()
  @IsOptional()
  heightCm?: number;

  @IsNumber()
  @IsOptional()
  weightKg?: number;

  @IsString()
  @IsOptional()
  isSmoker?: string;

  @IsString()
  @IsOptional()
  chronicConditions?: string;

  @IsString()
  @IsOptional()
  currentMedications?: string;
} 