import { Injectable, UnauthorizedException, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@shared/models/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, LoginUserDto, UpdateUserProfileDto } from './dto'; // Імпортуємо DTO

// Тип для повернення користувача без хешу пароля
export type SanitizedUser = Omit<User, 'passwordHash'>;

// ---> ДОДАНО: Інтерфейс для відповіді з профілем користувача
export interface UserProfileResponse extends SanitizedUser {
  age?: number | null;
  bmi?: number | null;
}
// ---<

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name); // Додаємо Logger тут

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

  async getUserProfile(userId: string): Promise<UserProfileResponse> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const sanitizedUser = this.sanitizeUser(user);

    // ---> ДОДАНО: Обчислення віку
    let age: number | null = null;
    if (user.dateOfBirth) {
      const birthDate = new Date(user.dateOfBirth);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }
    // ---<

    // ---> ДОДАНО: Обчислення ІМТ
    let bmi: number | null = null;
    if (user.heightCm && user.weightKg && user.heightCm > 0) {
      const heightInMeters = user.heightCm / 100;
      bmi = parseFloat((user.weightKg / (heightInMeters * heightInMeters)).toFixed(2)); // Округлення до 2 знаків
    }
    // ---<

    return {
      ...sanitizedUser,
      age,
      bmi,
    };
  }

  async updateUserProfile(userId: string, updateUserProfileDto: UpdateUserProfileDto): Promise<UserProfileResponse> {
    this.logger.log(`[updateUserProfile] Attempting to update profile for userId: ${userId}`);
    this.logger.debug(`[updateUserProfile] Received DTO: ${JSON.stringify(updateUserProfileDto)}`);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.warn(`[updateUserProfile] User not found for userId: ${userId}`);
      throw new NotFoundException('User not found');
    }
    this.logger.log(`[updateUserProfile] Found user: ${user.email} (ID: ${user.id})`);
    this.logger.debug(`[updateUserProfile] User before update: ${JSON.stringify(this.sanitizeUser(user))}`);

    Object.assign(user, updateUserProfileDto);
    this.logger.debug(`[updateUserProfile] User object after Object.assign: ${JSON.stringify(this.sanitizeUser(user))}`);

    const updatedUser = await this.userRepository.save(user);
    this.logger.log(`[updateUserProfile] User saved. Returned from repository: ${updatedUser.email} (ID: ${updatedUser.id})`);
    this.logger.debug(`[updateUserProfile] User after save: ${JSON.stringify(this.sanitizeUser(updatedUser))}`);

    // ---> ДОДАНО: Повторне обчислення віку та ІМТ після оновлення
    let age: number | null = null;
    if (updatedUser.dateOfBirth) {
      const birthDate = new Date(updatedUser.dateOfBirth);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    let bmi: number | null = null;
    if (updatedUser.heightCm && updatedUser.weightKg && updatedUser.heightCm > 0) {
      const heightInMeters = updatedUser.heightCm / 100;
      bmi = parseFloat((updatedUser.weightKg / (heightInMeters * heightInMeters)).toFixed(2));
    }
    // ---<
    
    const sanitizedUpdatedUser = this.sanitizeUser(updatedUser);
    this.logger.log(`[updateUserProfile] Returning sanitized user: ${sanitizedUpdatedUser.email} (ID: ${sanitizedUpdatedUser.id})`);
    return {
      ...sanitizedUpdatedUser,
      age,
      bmi,
    };
  }
}
