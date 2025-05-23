import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  Request, // Для доступу до req.user
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Logger, // <--- Додано Logger
} from '@nestjs/common';
import { JwtAuthGuard } from '@shared/jwt-auth.guard'; // Шлях до вашого JwtAuthGuard
import { BloodPressureService } from './blood-pressure.service';
import { CreateBloodPressureReadingDto, UpdateBloodPressureReadingDto } from './dto';
import { BloodPressureReading } from '@shared/models/blood-pressure-reading.entity';

@Controller('blood-pressure') // Базовий шлях для цього контролера
@UseGuards(JwtAuthGuard) // Застосовуємо JWT Guard до всіх ендпоінтів
export class BloodPressureController {
  private readonly logger = new Logger(BloodPressureController.name); // <--- Ініціалізація Logger

  constructor(private readonly bpService: BloodPressureService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: any, // Отримуємо об'єкт запиту, щоб дістати userId
    @Body() createDto: CreateBloodPressureReadingDto,
  ): Promise<BloodPressureReading> {
    this.logger.log(`Attempting to create blood pressure reading. User object from request: ${JSON.stringify(req.user)}`); // <--- Логування req.user
    const userId = req.user.id; // <--- Повернуто на req.user.id
    this.logger.log(`Extracted userId: ${userId}`); // <--- Логування userId
    return this.bpService.create(userId, createDto);
  }

  // Ендпоінт для отримання всіх записів тиску поточного користувача
  @Get('my')
  async findAllMyReadings(@Request() req: any): Promise<BloodPressureReading[]> {
    const userId = req.user.id; // <--- Повернуто на req.user.id
    return this.bpService.findAllByUser(userId);
  }

  // Ендпоінт для отримання всіх записів тиску конкретного користувача (для адміна, якщо потрібно)
  // Якщо цей функціонал не потрібен, його можна видалити або захистити окремим AdminGuard
  // @Get('user/:userId')
  // async findAllByUser(
  //   @Param('userId', ParseUUIDPipe) userId: string,
  // ): Promise<BloodPressureReading[]> {
  //   return this.bpService.findAllByUser(userId);
  // }

  @Get(':readingId')
  async findOne(
    @Param('readingId', ParseUUIDPipe) readingId: string,
    @Request() req: any,
  ): Promise<BloodPressureReading> {
    const userId = req.user.id; // <--- Повернуто на req.user.id
    return this.bpService.findOne(readingId, userId);
  }

  @Put(':readingId')
  async update(
    @Param('readingId', ParseUUIDPipe) readingId: string,
    @Request() req: any,
    @Body() updateDto: UpdateBloodPressureReadingDto,
  ): Promise<BloodPressureReading> {
    const userId = req.user.id; // <--- Повернуто на req.user.id
    return this.bpService.update(readingId, userId, updateDto);
  }

  @Delete(':readingId')
  @HttpCode(HttpStatus.NO_CONTENT) // Стандартний код для успішного DELETE без відповіді
  async remove(
    @Param('readingId', ParseUUIDPipe) readingId: string,
    @Request() req: any,
  ): Promise<void> {
    const userId = req.user.id; // <--- Повернуто на req.user.id
    return this.bpService.remove(readingId, userId);
  }
} 