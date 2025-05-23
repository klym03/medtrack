import { Repository } from 'typeorm';
import { MedicationReminder } from '../../../shared/models/medication-reminder.entity';
import { User } from '../../../shared/models/user.entity';
import { Medication } from '../../../shared/models/medication.entity';
import { CreateMedicationReminderDto, UpdateMedicationReminderDto } from './dto';
export declare class MedicationReminderService {
    private readonly reminderRepository;
    private readonly medicationRepository;
    private readonly userRepository;
    constructor(reminderRepository: Repository<MedicationReminder>, medicationRepository: Repository<Medication>, userRepository: Repository<User>);
    create(userId: string, createDto: CreateMedicationReminderDto): Promise<MedicationReminder>;
    findAllForUser(userId: string): Promise<MedicationReminder[]>;
    findOneForUser(userId: string, reminderId: string): Promise<MedicationReminder>;
    update(userId: string, reminderId: string, updateDto: UpdateMedicationReminderDto): Promise<MedicationReminder>;
    remove(userId: string, reminderId: string): Promise<void>;
}
