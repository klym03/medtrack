import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('blood_pressure_readings') // Назва таблиці в БД
export class BloodPressureReading {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, user => user.bloodPressureReadings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn() // Автоматично встановлюється при створенні
  timestamp: Date;

  @Column({ type: 'integer' })
  systolic: number;

  @Column({ type: 'integer' })
  diastolic: number;
} 