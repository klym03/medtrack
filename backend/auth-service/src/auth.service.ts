import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@shared/models';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, LoginUserDto, UpdateUserProfileDto } from './dto'; // Імпортуємо DTO

// Тип для повернення користувача без хешу пароля
export type SanitizedUser = Omit<User, 'passwordHash'>;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  private sanitizeUser(user: User): SanitizedUser {
    const { passwordHash, ...result } = user;
    return result;
  }

  async register(createUserDto: CreateUserDto): Promise<SanitizedUser> {
    const { email, password, ...rest } = createUserDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUserEntity = this.userRepository.create({
      ...rest,
      email,
      passwordHash: hashedPassword,
      profileComplete: false, // Явно встановлюємо при реєстрації
    });

    const savedUser = await this.userRepository.save(newUserEntity);
    return this.sanitizeUser(savedUser);
  }

  async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials - user not found');
    }

    const isPasswordMatching = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials - password mismatch');
    }

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  async validateUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async getUserProfile(userId: string): Promise<SanitizedUser> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.sanitizeUser(user);
  }

  async updateUserProfile(userId: string, updateUserProfileDto: UpdateUserProfileDto): Promise<SanitizedUser> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Оновлюємо лише передані поля
    // TypeORM 'save' може робити це частково, але для ясності оновимо явно
    Object.assign(user, updateUserProfileDto);

    // Якщо оновлюються певні поля, які впливають на profileComplete, оновити його тут
    // Наприклад, якщо всі обов'язкові поля профілю заповнені:
    // user.profileComplete = !!(user.name && user.dateOfBirth && user.sex ...);
    // Поки що, якщо profileComplete передається в DTO, воно буде оновлено.
    // Якщо ні, воно залишиться як є, або може бути встановлено на true, якщо всі інші необхідні поля є.
    // Для простоти, зараз просто оновлюємо те, що прийшло.

    const updatedUser = await this.userRepository.save(user);
    return this.sanitizeUser(updatedUser);
  }
}
