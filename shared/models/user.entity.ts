import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Analysis } from './analysis.entity';
import { BloodPressureReading } from './blood-pressure-reading.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string | null;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false }) // Зберігатимемо хеш пароля
  passwordHash: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  sex: string | null; // 'male', 'female', etc.

  @Column({ type: 'integer', nullable: true })
  heightCm: number | null;

  @Column({ type: 'float', nullable: true })
  weightKg: number | null;

  @Column({ type: 'varchar', length: 10, nullable: true }) // 'yes', 'no', 'stopped'
  isSmoker: string | null;

  @Column({ type: 'text', nullable: true })
  chronicConditions: string | null; // Можна зберігати як JSON string або текст

  @Column({ type: 'text', nullable: true })
  currentMedications: string | null; // Можна зберігати як JSON string або текст

  @Column({ type: 'boolean', default: false })
  profileComplete: boolean;

  @Column({ type: 'integer', nullable: true })
  usualSystolic: number | null;

  @Column({ type: 'integer', nullable: true })
  usualDiastolic: number | null;

  @OneToMany(() => Analysis, analysis => analysis.user)
  analyses: Analysis[];

  @OneToMany(() => BloodPressureReading, reading => reading.user)
  bloodPressureReadings: BloodPressureReading[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 