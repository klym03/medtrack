import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('ping') // Простий ендпоінт для перевірки стану сервісу
  getHello(): string {
    return this.appService.getHello();
  }
} 