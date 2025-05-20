import { Controller, Post, Body, HttpCode, HttpStatus, ValidationPipe, UseGuards, Get, Request, Patch } from '@nestjs/common';
import { AuthService, SanitizedUser } from './auth.service';
import { CreateUserDto, LoginUserDto, UpdateUserProfileDto } from './dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) createUserDto: CreateUserDto): Promise<SanitizedUser> {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
    return this.authService.login(loginUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req): Promise<SanitizedUser> {
    // req.user містить payload з JWT (id користувача як sub)
    const userId = req.user.sub; 
    return this.authService.getUserProfile(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  async updateProfile(
    @Request() req,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, skipMissingProperties: true })) 
    updateUserProfileDto: UpdateUserProfileDto
  ): Promise<SanitizedUser> {
    const userId = req.user.sub;
    return this.authService.updateUserProfile(userId, updateUserProfileDto);
  }
}
