import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicationReminder, DayOfWeek } from '@shared/models/medication-reminder.entity';
import { User } from '@shared/models/user.entity';
import { Medication } from '@shared/models/medication.entity';
import { CreateMedicationReminderDto, UpdateMedicationReminderDto } from './dto';

@Injectable()
export class MedicationReminderService {
  constructor(
    @InjectRepository(MedicationReminder)
    private readonly reminderRepository: Repository<MedicationReminder>,
    @InjectRepository(Medication)
    private readonly medicationRepository: Repository<Medication>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userId: string, createDto: CreateMedicationReminderDto): Promise<MedicationReminder> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const medication = await this.medicationRepository.findOne({ 
      where: { id: createDto.medicationId, user: { id: userId } },
      relations: ['user'] 
    });
    if (!medication) {
      throw new NotFoundException(`Medication with ID "${createDto.medicationId}" not found or does not belong to the user.`);
    }

    const newReminder = this.reminderRepository.create({
      ...createDto,
      user,
      medication,
      reminderTime: createDto.reminderTime, // Ensure this is handled correctly (e.g. as string or converted to Date)
      daysOfWeek: createDto.daysOfWeek as DayOfWeek[], // Type assertion if necessary
      specificDate: createDto.specificDate ? new Date(createDto.specificDate) : null,
      isActive: createDto.isActive !== undefined ? createDto.isActive : true, // Default to true if not provided
    });

    return this.reminderRepository.save(newReminder);
  }

  async findAllForUser(userId: string): Promise<MedicationReminder[]> {
    return this.reminderRepository.find({
      where: { user: { id: userId } },
      relations: ['medication'], // Optionally load medication details
      order: { createdAt: 'DESC' },
    });
  }

  async findOneForUser(userId: string, reminderId: string): Promise<MedicationReminder> {
    const reminder = await this.reminderRepository.findOne({
      where: { id: reminderId, user: { id: userId } },
      relations: ['medication', 'user'],
    });

    if (!reminder) {
      throw new NotFoundException(`Medication reminder with ID "${reminderId}" not found or does not belong to the user.`);
    }
    return reminder;
  }

  async update(userId: string, reminderId: string, updateDto: UpdateMedicationReminderDto): Promise<MedicationReminder> {
    const reminder = await this.findOneForUser(userId, reminderId); // Ensures reminder exists and belongs to user

    if (updateDto.medicationId && updateDto.medicationId !== reminder.medication.id) {
      const newMedication = await this.medicationRepository.findOne({ 
        where: { id: updateDto.medicationId, user: { id: userId } },
        relations: ['user']
      });
      if (!newMedication) {
        throw new NotFoundException(`New medication with ID "${updateDto.medicationId}" not found or does not belong to user.`);
      }
      reminder.medication = newMedication;
    }

    // Update other fields
    if (updateDto.reminderTime !== undefined) {
      reminder.reminderTime = updateDto.reminderTime;
    }
    if (updateDto.daysOfWeek !== undefined) {
      reminder.daysOfWeek = updateDto.daysOfWeek as DayOfWeek[];
    }
    if (updateDto.specificDate !== undefined) {
        reminder.specificDate = updateDto.specificDate ? new Date(updateDto.specificDate) : null;
    }
    if (updateDto.isActive !== undefined) {
      reminder.isActive = updateDto.isActive;
    }
    if (updateDto.notes !== undefined) {
      reminder.notes = updateDto.notes;
    }

    return this.reminderRepository.save(reminder);
  }

  async remove(userId: string, reminderId: string): Promise<void> {
    const reminder = await this.findOneForUser(userId, reminderId); // Ensures reminder exists and belongs to user
    await this.reminderRepository.remove(reminder);
  }
}
