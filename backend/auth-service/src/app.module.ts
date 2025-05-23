import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@shared/models/user.entity';
import { Analysis } from '@shared/models/analysis.entity';
import { BloodPressureReading } from '@shared/models/blood-pressure-reading.entity';
import { Indicator } from '@shared/models/indicator.entity';
import { Medication } from '@shared/models/medication.entity';
import { MedicationReminder } from '@shared/models/medication-reminder.entity';
import { AuthModule } from './auth.module';

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
          throw new Error('DATABASE_URL environment variable is not set');
        }

        const url = new URL(databaseUrl); 
        
        return {
          type: 'postgres',
          host: url.hostname,
          port: parseInt(url.port, 10) || 5432,
          username: url.username,
          password: url.password,
          database: url.pathname.slice(1),
          entities: [User, Analysis, Indicator, BloodPressureReading, Medication, MedicationReminder],
          synchronize: false,
          dropSchema: false,
          logging: true,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
