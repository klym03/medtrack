import { AuthService, UserProfileResponse } from './auth.service';
import { CreateUserDto, LoginUserDto, UpdateUserProfileDto } from './dto';
export declare class AuthController {
    private readonly authService;
    private readonly logger;
    constructor(authService: AuthService);
    register(createUserDto: CreateUserDto): Promise<UserProfileResponse>;
    login(loginUserDto: LoginUserDto): Promise<{
        accessToken: string;
    }>;
    getProfile(req: any): Promise<UserProfileResponse>;
    updateProfile(req: any, updateUserProfileDto: UpdateUserProfileDto): Promise<UserProfileResponse>;
}
