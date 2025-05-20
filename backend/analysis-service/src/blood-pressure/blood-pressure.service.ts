import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BloodPressureReading } from '../../../../shared/models/blood-pressure-reading.entity';
import { User } from '../../../../shared/models/user.entity'; // Потрібно для перевірки власника
import { CreateBloodPressureReadingDto, UpdateBloodPressureReadingDto } from './dto';

@Injectable()
export class BloodPressureService {
  constructor(
    @InjectRepository(BloodPressureReading)
    private readonly readingRepository: Repository<BloodPressureReading>,
    // Можна не інжектувати UserRepository, якщо перевірка користувача робиться на рівні guard/controller
    // або якщо user ID береться з JWT і йому просто довіряємо
  ) {}

  async create(
    userIdFromJwt: string, // ID користувача з JWT
    createDto: CreateBloodPressureReadingDto,
  ): Promise<BloodPressureReading> {
    const newReading = this.readingRepository.create({
      ...createDto,
      userId: userIdFromJwt, // Призначаємо userId з JWT
      timestamp: createDto.timestamp ? new Date(createDto.timestamp) : new Date(), // Встановлюємо час
    });
    return this.readingRepository.save(newReading);
  }

  async findAllByUser(userId: string): Promise<BloodPressureReading[]> {
    return this.readingRepository.find({
      where: { userId },
      order: { timestamp: 'DESC' }, // Сортуємо від найновіших
    });
  }

  async findOne(readingId: string, userIdFromJwt: string): Promise<BloodPressureReading> {
    const reading = await this.readingRepository.findOne({ where: { id: readingId } });
    if (!reading) {
      throw new NotFoundException(`Запис тиску з ID "${readingId}" не знайдено.`);
    }
    // Перевірка, чи користувач є власником запису
    if (reading.userId !== userIdFromJwt) {
      throw new ForbiddenException('Ви не маєте доступу до цього запису.');
    }
    return reading;
  }

  async update(
    readingId: string,
    userIdFromJwt: string, // ID користувача з JWT для перевірки власності
    updateDto: UpdateBloodPressureReadingDto,
  ): Promise<BloodPressureReading> {
    const reading = await this.findOne(readingId, userIdFromJwt); // findOne вже містить перевірку власності
    
    // Оновлюємо тільки надані поля
    if (updateDto.systolic !== undefined) reading.systolic = updateDto.systolic;
    if (updateDto.diastolic !== undefined) reading.diastolic = updateDto.diastolic;
    if (updateDto.timestamp !== undefined) reading.timestamp = new Date(updateDto.timestamp);

    return this.readingRepository.save(reading);
  }

  async remove(readingId: string, userIdFromJwt: string): Promise<void> {
    const reading = await this.findOne(readingId, userIdFromJwt); // findOne вже містить перевірку власності
    await this.readingRepository.remove(reading);
  }
} 