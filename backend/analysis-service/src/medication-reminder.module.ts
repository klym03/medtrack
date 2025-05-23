import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicationReminderService } from './medication-reminder.service';
import { MedicationReminderController } from './medication-reminder.controller';
import { MedicationReminder } from '@shared/models/medication-reminder.entity';
import { User } from '@shared/models/user.entity';
import { Medication } from '@shared/models/medication.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicationReminder, User, Medication]),
    AuthModule, // For JWT strategy and guard
  ],
  controllers: [MedicationReminderController],
  providers: [MedicationReminderService],
})
export class MedicationReminderModule {}
