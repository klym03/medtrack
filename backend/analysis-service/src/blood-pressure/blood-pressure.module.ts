import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BloodPressureReading } from '../../../../shared/models/blood-pressure-reading.entity';
import { User } from '../../../../shared/models/user.entity'; // User потрібен для сервісу, якщо він там використовується
import { BloodPressureService } from './blood-pressure.service';
import { BloodPressureController } from './blood-pressure.controller';
// Не забути імпортувати та налаштувати AuthModule або JwtStrategy, якщо потрібно для Guard
// Але JwtAuthGuard, ймовірно, глобальний або експортується з AuthModule

@Module({
  imports: [
    TypeOrmModule.forFeature([BloodPressureReading, User]), // Реєструємо сутності
    // Якщо JwtAuthGuard не глобальний, потрібно імпортувати модуль, що його надає
    // Наприклад, AuthModule.forRoot(...) або SharedModule, що експортує AuthModule
  ],
  providers: [BloodPressureService],
  controllers: [BloodPressureController],
  exports: [BloodPressureService], // Експортуємо сервіс, якщо він буде потрібен в інших модулях
})
export class BloodPressureModule {} 