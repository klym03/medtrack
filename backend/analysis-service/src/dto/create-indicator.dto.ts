import { IsString, IsOptional, IsNotEmpty, Length } from 'class-validator';

export class CreateIndicatorDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @IsString()
  @IsOptional()
  @Length(0, 100) // Дозволяємо порожній рядок, якщо значення не вказано, але якщо є, то не більше 100 символів
  value?: string | null;

  @IsString()
  @IsOptional()
  @Length(0, 50)
  units?: string | null;

  @IsString()
  @IsOptional()
  @Length(0, 100)
  referenceRange?: string | null;
} 