import { IsInt, IsOptional, Min, Max, IsDateString } from 'class-validator';

export class UpdateBloodPressureReadingDto {
  @IsOptional()
  @IsInt({ message: 'Систолічний тиск повинен бути цілим числом' })
  @Min(50, { message: 'Систолічний тиск не може бути менше 50' })
  @Max(300, { message: 'Систолічний тиск не може бути більше 300' })
  systolic?: number;

  @IsOptional()
  @IsInt({ message: 'Діастолічний тиск повинен бути цілим числом' })
  @Min(30, { message: 'Діастолічний тиск не може бути менше 30' })
  @Max(200, { message: 'Діастолічний тиск не може бути більше 200' })
  diastolic?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Час вимірювання повинен бути у форматі ISO8601' })
  timestamp?: Date;
} 