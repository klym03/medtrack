import { DayOfWeek } from '../../../../../shared/models/medication-reminder.entity';
export declare class CreateMedicationReminderDto {
    medicationId: string;
    reminderTime: string;
    daysOfWeek?: DayOfWeek[];
    specificDate?: string;
    isActive?: boolean;
    notes?: string;
}
