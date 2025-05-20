import { IsInt, IsNotEmpty, Min, Max, IsOptional, IsDateString } from 'class-validator';

export class CreateBloodPressureReadingDto {
  @IsInt({ message: 'Систолічний тиск повинен бути цілим числом' })
  @Min(50, { message: 'Систолічний тиск не може бути менше 50' })
  @Max(300, { message: 'Систолічний тиск не може бути більше 300' })
  @IsNotEmpty({ message: 'Систолічний тиск є обов\'язковим' })
  systolic: number;

  @IsInt({ message: 'Діастолічний тиск повинен бути цілим числом' })
  @Min(30, { message: 'Діастолічний тиск не може бути менше 30' })
  @Max(200, { message: 'Діастолічний тиск не може бути більше 200' })
  @IsNotEmpty({ message: 'Діастолічний тиск є обов\'язковим' })
  diastolic: number;

  @IsOptional()
  @IsDateString({}, { message: 'Час вимірювання повинен бути у форматі ISO8601' })
  timestamp?: Date; // Дозволяємо користувачу вказати час, інакше буде поточний
} 