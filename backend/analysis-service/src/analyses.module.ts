import { Module, forwardRef } from '@nestjs/common';
import { AnalysesService } from './analyses/analyses.service';
import { AnalysesController } from './analyses/analyses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Analysis } from '@shared/models/analysis.entity';
import { Indicator } from '@shared/models/indicator.entity';
import { User } from '@shared/models/user.entity';
import { IndicatorReferenceRange } from '@shared/models/indicator-reference-range.entity';
import { BloodPressureReading } from '@shared/models/blood-pressure-reading.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Analysis, Indicator, User, IndicatorReferenceRange, BloodPressureReading]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET is not configured in environment variables.');
        }
        return {
          secret: secret,
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN', '3600s'),
          },
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  providers: [AnalysesService, JwtStrategy],
  controllers: [AnalysesController],
  exports: [AnalysesService, JwtStrategy]
})
export class AnalysesModule {}
