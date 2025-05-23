import { Controller, Post, Body, HttpCode, HttpStatus, ValidationPipe, UseGuards, Get, Request, Patch, Logger } from '@nestjs/common';
import { AuthService, UserProfileResponse } from './auth.service';
import { CreateUserDto, LoginUserDto, UpdateUserProfileDto } from './dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) createUserDto: CreateUserDto): Promise<UserProfileResponse> {
    this.logger.log('Attempting to register user...');
    this.logger.log('Received DTO:', JSON.stringify(createUserDto));
    const registeredUser = await this.authService.register(createUserDto);
    return registeredUser as UserProfileResponse;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
    return this.authService.login(loginUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req): Promise<UserProfileResponse> {
    const userId = req.user.id;
    return this.authService.getUserProfile(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  async updateProfile(
    @Request() req,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, skipMissingProperties: true })) 
    updateUserProfileDto: UpdateUserProfileDto
  ): Promise<UserProfileResponse> {
    const userId = req.user.id;
    return this.authService.updateUserProfile(userId, updateUserProfileDto);
  }
}
