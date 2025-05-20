import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Analysis, BloodPressureReading, Indicator } from '@shared/models';
import { AuthModule } from './auth.module';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '..', '..', '..', '..', '..', '..', '.env'),
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
          port: parseInt(url.port, 10),
          username: url.username,
          password: url.password,
          database: url.pathname.slice(1),
          entities: [User, Analysis, Indicator, BloodPressureReading],
          synchronize: true,
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
