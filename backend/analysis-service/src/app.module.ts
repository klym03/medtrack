import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@shared/models/user.entity';
import { Analysis } from '@shared/models/analysis.entity';
import { Indicator } from '@shared/models/indicator.entity';
import { BloodPressureReading } from '@shared/models/blood-pressure-reading.entity';
import { Medication } from '@shared/models/medication.entity';
import { MedicationReminder } from '@shared/models/medication-reminder.entity';
import { IndicatorReferenceRange } from '@shared/models/indicator-reference-range.entity';
import { AnalysesModule } from './analyses.module';
import { BloodPressureModule } from './blood-pressure/blood-pressure.module';
import { MedicationModule } from './medication/medication.module';
import { MedicationReminderModule } from './medication-reminder.module';
import { UserProfileContextModule } from './user-profile-context.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        if (!databaseUrl) {
          throw new Error('DATABASE_URL environment variable is not set for analysis service');
        }
        const url = new URL(databaseUrl);

        return {
          type: 'postgres',
          host: url.hostname,
          port: parseInt(url.port, 10) || 5432,
          username: url.username,
          password: url.password,
          database: url.pathname.slice(1),
          entities: [User, Analysis, Indicator, BloodPressureReading, Medication, MedicationReminder, IndicatorReferenceRange],
          synchronize: false,
          dropSchema: false,
          logging: true,
        };
      },
      inject: [ConfigService],
    }),
    AnalysesModule,
    BloodPressureModule,
    MedicationModule,
    MedicationReminderModule,
    UserProfileContextModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
