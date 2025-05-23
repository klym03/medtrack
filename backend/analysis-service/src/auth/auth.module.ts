import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@shared/models/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule, // Ensure ConfigModule is available for ConfigService injection in JwtStrategy
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '3600s' },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]), // Needed for JwtStrategy to fetch user details
  ],
  providers: [JwtStrategy, JwtAuthGuard], // Provide JwtStrategy and JwtAuthGuard
  exports: [PassportModule, JwtAuthGuard, JwtModule], // Export PassportModule and JwtAuthGuard so other modules can use them
})
export class AuthModule {} 