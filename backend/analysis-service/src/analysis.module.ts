import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Analysis, Indicator, User } from '@shared/models';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Analysis, Indicator, User]),
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
  ],
  providers: [AnalysisService, JwtStrategy],
  controllers: [AnalysisController],
  exports: [AnalysisService, JwtStrategy]
})
export class AnalysisModule {}
