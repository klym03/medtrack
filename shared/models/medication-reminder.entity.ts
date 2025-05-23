import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
// import { forwardRef } from '@nestjs/common'; // Прибираємо forwardRef
import { User } from './user.entity';
import { Medication } from './medication.entity';

// Можливі дні тижня для зручності
export enum DayOfWeek {
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
}

@Entity('medication_reminders')
export class MedicationReminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user: User) => user.medicationReminders, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Medication, (medication: Medication) => medication.reminders, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'medication_id' })
  medication: Medication;

  @Column({ type: 'time', name: 'reminder_time' })
  reminderTime: string; // Format HH:MM:SS or HH:MM

  // Зберігатимемо як масив рядків у PostgreSQL, або можна використовувати JSONB
  @Column({ type: 'varchar', array: true, nullable: true, name: 'days_of_week' })
  daysOfWeek: DayOfWeek[] | null; // e.g., [DayOfWeek.MONDAY, DayOfWeek.FRIDAY]

  @Column({ type: 'date', nullable: true, name: 'specific_date' })
  specificDate: Date | null; // For one-time reminders

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'last_triggered_at' })
  lastTriggeredAt: Date | null;
  
  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', name: 'updated_at' })
  updatedAt: Date;
} 