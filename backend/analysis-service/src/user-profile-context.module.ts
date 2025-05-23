import { Module } from '@nestjs/common';
import { UserProfileContextController } from './user-profile-context.controller';
import { UserProfileContextService } from './user-profile-context.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Analysis, Indicator, BloodPressureReading } from '@shared/models';
import { AuthModule } from './auth/auth.module'; // Виправлено шлях

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Analysis, Indicator, BloodPressureReading]),
    AuthModule, // Для JwtAuthGuard та інжекції User з req
  ],
  controllers: [UserProfileContextController],
  providers: [UserProfileContextService]
})
export class UserProfileContextModule {}
