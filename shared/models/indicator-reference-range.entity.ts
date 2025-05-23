import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

export enum SexConstraint {
  ANY = 'any',
  MALE = 'male',
  FEMALE = 'female',
}

@Entity('indicator_reference_ranges')
@Index('IDX_indicator_range_specificity', ['indicatorName', 'units', 'sexConstraint', 'ageMinYears', 'ageMaxYears'], { unique: true })
export class IndicatorReferenceRange {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, comment: 'Standardized name of the indicator' })
  indicatorName: string;

  @Column({ type: 'varchar', length: 50, comment: 'Units of measurement' })
  units: string;

  @Column({
    type: 'enum',
    enum: SexConstraint,
    default: SexConstraint.ANY,
    comment: 'Sex specificity of the range: any, male, female'
  })
  sexConstraint: SexConstraint;

  @Column({ type: 'integer', nullable: true, comment: 'Minimum age in years for this range (inclusive, null if no lower age limit)' })
  ageMinYears: number | null;

  @Column({ type: 'integer', nullable: true, comment: 'Maximum age in years for this range (inclusive, null if no upper age limit)' })
  ageMaxYears: number | null;

  @Column({ type: 'float', nullable: true, comment: 'Lower bound of the normal range' })
  normalLow: number | null;

  @Column({ type: 'float', nullable: true, comment: 'Upper bound of the normal range' })
  normalHigh: number | null;

  @Column({ type: 'text', nullable: true, comment: 'Optional textual representation of the range, e.g., \'< 5.0\' or \' > 100\'. Use normalLow/High for numeric comparisons.' })
  textualRange: string | null;

  @Column({ type: 'text', nullable: true, comment: 'Source or citation for this reference range' })
  source: string | null;
} 