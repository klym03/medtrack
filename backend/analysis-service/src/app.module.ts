import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Analysis, Indicator, BloodPressureReading } from '@shared/models';
import { AnalysisModule } from './analysis.module';
import { BloodPressureModule } from './blood-pressure/blood-pressure.module';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Шлях до .env файлу в корені монорепозиторію
      envFilePath: path.resolve(__dirname, '..', '..', '..', '.env'),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('ANALYSIS_DATABASE_URL'),
        entities: [Analysis, Indicator, BloodPressureReading, User],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    AnalysisModule,
    BloodPressureModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
