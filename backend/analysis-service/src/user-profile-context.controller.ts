import { Controller, Get, Query, Req, UseGuards, ParseBoolPipe, DefaultValuePipe, NotFoundException } from '@nestjs/common';
import { UserProfileContextService } from './user-profile-context.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'; // Виправлено шлях
import { UserProfileContextResponseDto } from './dto'; 
import { User as UserEntity } from '@shared/models'; // Для типізації req.user

@Controller('chat/profile-context') // Базовий шлях для цього контролера
export class UserProfileContextController {
  constructor(private readonly contextService: UserProfileContextService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getProfileContext(
    @Req() req: { user: UserEntity }, // Отримуємо об'єкт користувача з запиту (після JwtAuthGuard)
    @Query('full', new DefaultValuePipe(false), ParseBoolPipe) full: boolean, // Query параметр ?full=true/false
  ): Promise<UserProfileContextResponseDto> {
    if (!req.user || !req.user.id) {
      // Ця перевірка зайва, якщо JwtAuthGuard працює коректно і завжди додає user
      throw new NotFoundException('User ID not found in request after authentication.');
    }
    return this.contextService.getUserProfileContext(req.user.id, full);
  }
}
