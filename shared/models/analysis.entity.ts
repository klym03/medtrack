import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Indicator } from './indicator.entity';

@Entity('analyses') // Назва таблиці в БД
export class Analysis {
  @PrimaryGeneratedColumn('uuid') // Використовуємо UUID для ID, як і в User
  id: string;

  @Column({ type: 'uuid' }) // Зберігаємо user_id як UUID
  userId: string;

  @ManyToOne(() => User, user => user.analyses, { onDelete: 'CASCADE' }) // Зв'язок з User
  @JoinColumn({ name: 'userId' }) // Явно вказуємо стовпець для зв'язку
  user: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  filename: string | null;

  @CreateDateColumn() // Автоматично встановлюється при створенні
  uploadTimestamp: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  documentType: string | null; // Наприклад, 'Загальний аналіз крові', 'МРТ заключення'

  @Column({ type: 'varchar', length: 50, nullable: true }) // Можливо, краще Date, якщо формат завжди відомий
  analysisDate: string | null; // Дата самого аналізу

  @Column({ type: 'text', nullable: true })
  rawResultText: string | null; // Необроблений текст, отриманий з OCR або введений вручну

  @OneToMany(() => Indicator, indicator => indicator.analysis, { cascade: true, eager: false }) // Зв'язок з Indicator
  indicators: Indicator[];

  @Column({ type: 'jsonb', nullable: true }) // Для зберігання структурованих даних з описових звітів
  structuredReportData: Record<string, any> | null;
} 