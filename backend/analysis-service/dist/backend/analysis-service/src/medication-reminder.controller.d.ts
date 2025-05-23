import { MedicationReminderService } from './medication-reminder.service';
import { CreateMedicationReminderDto, UpdateMedicationReminderDto } from './dto';
import { User as UserEntity } from '@shared/models';
export declare class MedicationReminderController {
    private readonly reminderService;
    constructor(reminderService: MedicationReminderService);
    create(req: {
        user: UserEntity;
    }, createReminderDto: CreateMedicationReminderDto): Promise<import("@shared/models").MedicationReminder>;
    findAll(req: {
        user: UserEntity;
    }): Promise<import("@shared/models").MedicationReminder[]>;
    findOne(req: {
        user: UserEntity;
    }, id: string): Promise<import("@shared/models").MedicationReminder>;
    update(req: {
        user: UserEntity;
    }, id: string, updateReminderDto: UpdateMedicationReminderDto): Promise<import("@shared/models").MedicationReminder>;
    remove(req: {
        user: UserEntity;
    }, id: string): Promise<void>;
}
