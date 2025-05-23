import { IsString, IsOptional, IsNotEmpty, Length, IsUUID } from 'class-validator';

export class UpdateIndicatorDto {
  @IsUUID()
  @IsOptional() // ID опціональний: якщо є - оновлюємо, якщо немає - створюємо (або помилка, залежно від логіки сервісу)
  id?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional() // Всі поля робимо опціональними для PUT/PATCH
  @Length(1, 255)
  name?: string;

  @IsString()
  @IsOptional()
  @Length(0, 100)
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