import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'; // Якщо використовуєте Swagger

// Допоміжні класи для вкладених структур
class LastBpDto {
  @ApiPropertyOptional()
  systolic?: number | null;

  @ApiPropertyOptional()
  diastolic?: number | null;

  @ApiPropertyOptional()
  timestamp?: string | null;
}

class AnalysisSummaryItemDto {
  @ApiProperty()
  id: number | string; // ID з Analysis entity

  @ApiPropertyOptional()
  type?: string | null;

  @ApiPropertyOptional()
  analysis_date?: string | null;

  @ApiPropertyOptional()
  uploaded?: string | null;

  @ApiPropertyOptional()
  filename?: string | null;
  
  @ApiPropertyOptional()
  raw_result_text?: string | null;
}

export class UserProfileContextResponseDto {
  @ApiPropertyOptional()
  name?: string | null;

  @ApiPropertyOptional()
  email?: string | null;

  @ApiPropertyOptional()
  age?: number | null;

  @ApiPropertyOptional()
  sex?: string | null;

  @ApiPropertyOptional()
  height_cm?: number | null;

  @ApiPropertyOptional()
  weight_kg?: number | null;

  @ApiPropertyOptional()
  bmi?: number | null;

  @ApiPropertyOptional()
  is_smoker?: string | null;
  
  @ApiPropertyOptional()
  usual_systolic?: number | null;

  @ApiPropertyOptional()
  usual_diastolic?: number | null;

  @ApiPropertyOptional({ type: () => LastBpDto })
  last_bp?: LastBpDto;

  @ApiPropertyOptional()
  indicators_summary?: string | null;

  @ApiPropertyOptional()
  chronic_conditions?: string | null;

  @ApiPropertyOptional()
  current_medications?: string | null;

  @ApiPropertyOptional()
  all_indicators_summary?: string | null;

  @ApiPropertyOptional({ type: () => [AnalysisSummaryItemDto] })
  all_analyses?: AnalysisSummaryItemDto[];
} 