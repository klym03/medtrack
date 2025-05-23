import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { Medication, User } from '@shared/models'; // Старий імпорт
import { Medication } from '@shared/models/medication.entity'; // <--- Виправлений прямий імпорт
import { User } from '@shared/models/user.entity'; // <--- Виправлений прямий імпорт
import { MedicationService } from './medication.service';
import { MedicationController } from './medication.controller';
import { AuthModule } from '../auth/auth.module'; // Assuming AuthModule exports JwtStrategy and PassportModule for guards

@Module({
  imports: [
    TypeOrmModule.forFeature([Medication, User]), // Register Medication and User entities
    AuthModule, // Import AuthModule if guards/strategies are needed and not globally provided
  ],
  providers: [MedicationService],
  controllers: [MedicationController],
})
export class MedicationModule {} 