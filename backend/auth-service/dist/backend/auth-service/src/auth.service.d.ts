import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '@shared/models';
import { CreateUserDto, LoginUserDto, UpdateUserProfileDto } from './dto';
export type SanitizedUser = Omit<User, 'passwordHash'>;
export declare class AuthService {
    private userRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    private sanitizeUser;
    register(createUserDto: CreateUserDto): Promise<SanitizedUser>;
    login(loginUserDto: LoginUserDto): Promise<{
        accessToken: string;
    }>;
    validateUserById(userId: string): Promise<User | null>;
    getUserProfile(userId: string): Promise<SanitizedUser>;
    updateUserProfile(userId: string, updateUserProfileDto: UpdateUserProfileDto): Promise<SanitizedUser>;
}
