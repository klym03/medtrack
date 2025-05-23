import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('recommendations')
export class Recommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string; // Унікальний ідентифікатор для URL, наприклад, 'zdorove-kharchuvannya'

  @Column({ type: 'text', nullable: true })
  shortDescription: string | null; // Короткий опис для списків

  @Column({ type: 'text' })
  fullContent: string; // Повний вміст рекомендації (може бути Markdown або HTML)

  @Column({ type: 'simple-array', nullable: true })
  tags: string[] | null; // Теги для категоризації та пошуку

  // Додаткові поля для можливої персоналізації в майбутньому (зараз не використовуються в логіці)
  @Column({ type: 'varchar', length: 10, nullable: true })
  targetSex: 'male' | 'female' | 'any' | null; // 'any' або null для всіх

  @Column({ type: 'integer', nullable: true })
  targetAgeMin: number | null;

  @Column({ type: 'integer', nullable: true })
  targetAgeMax: number | null;
  // Кінець додаткових полів

  @Column({ type: 'boolean', default: true })
  isActive: boolean; // Чи активна рекомендація для показу

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 