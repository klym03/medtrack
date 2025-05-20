import { AuthService, SanitizedUser } from './auth.service';
import { CreateUserDto, LoginUserDto, UpdateUserProfileDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(createUserDto: CreateUserDto): Promise<SanitizedUser>;
    login(loginUserDto: LoginUserDto): Promise<{
        accessToken: string;
    }>;
    getProfile(req: any): Promise<SanitizedUser>;
    updateProfile(req: any, updateUserProfileDto: UpdateUserProfileDto): Promise<SanitizedUser>;
}
