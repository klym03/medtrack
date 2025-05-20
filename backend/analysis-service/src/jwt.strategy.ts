import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@shared/models'; // Потрібно для типізації повернення
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

interface JwtPayload {
  sub: string; // user id
  email: string;
  // ... будь-які інші поля, які ви додавали до payload в auth-service
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // Для отримання повного об'єкта User
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new InternalServerErrorException('JWT_SECRET not configured');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<Omit<User, 'passwordHash'> | null> {
    // payload - це розшифрований JWT. 
    // payload.sub містить ID користувача.
    // Ми можемо тут завантажити користувача з БД, якщо це потрібно для подальшої логіки
    // або просто повернути основні дані з payload, якщо повний об'єкт User не потрібен на кожному запиті.
    const user = await this.userRepository.findOne({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('User from token not found');
    }
    // Видаляємо passwordHash перед поверненням
    const { passwordHash, ...result } = user;
    return result; 
    // Або, якщо не потрібен повний об'єкт User на кожному запиті, а лише ID:
    // return { id: payload.sub, email: payload.email }; // Адаптуйте тип повернення
  }
} 