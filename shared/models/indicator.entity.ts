import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Analysis } from './analysis.entity';

@Entity('indicators') // Назва таблиці в БД
export class Indicator {
  @PrimaryGeneratedColumn('uuid') // Використовуємо UUID для ID
  id: string;

  @Column({ type: 'uuid' })
  analysisId: string;

  @ManyToOne(() => Analysis, analysis => analysis.indicators, { onDelete: 'CASCADE' }) // Зв'язок з Analysis
  @JoinColumn({ name: 'analysisId' }) // Явно вказуємо стовпець для зв'язку
  analysis: Analysis;

  @Column({ type: 'varchar', length: 255 }) // Збільшив довжину для можливих довгих назв
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true }) // Значення може бути текстовим (напр. 'не виявлено')
  value: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  units: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  referenceRange: string | null;
} 