import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '@shared/models';
import { CreateUserDto, LoginUserDto, UpdateUserProfileDto } from './dto';
export type SanitizedUser = Omit<User, 'passwordHash'>;
export interface UserProfileResponse extends SanitizedUser {
    age?: number | null;
    bmi?: number | null;
}
export declare class AuthService {
    private userRepository;
    private jwtService;
    private readonly logger;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    private sanitizeUser;
    register(createUserDto: CreateUserDto): Promise<SanitizedUser>;
    login(loginUserDto: LoginUserDto): Promise<{
        accessToken: string;
    }>;
    validateUserById(userId: string): Promise<User | null>;
    getUserProfile(userId: string): Promise<UserProfileResponse>;
    updateUserProfile(userId: string, updateUserProfileDto: UpdateUserProfileDto): Promise<UserProfileResponse>;
}
