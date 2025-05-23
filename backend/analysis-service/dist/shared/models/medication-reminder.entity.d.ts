import { User } from './user.entity';
import { Medication } from './medication.entity';
export declare enum DayOfWeek {
    SUNDAY = "SUNDAY",
    MONDAY = "MONDAY",
    TUESDAY = "TUESDAY",
    WEDNESDAY = "WEDNESDAY",
    THURSDAY = "THURSDAY",
    FRIDAY = "FRIDAY",
    SATURDAY = "SATURDAY"
}
export declare class MedicationReminder {
    id: string;
    user: User;
    medication: Medication;
    reminderTime: string;
    daysOfWeek: DayOfWeek[] | null;
    specificDate: Date | null;
    isActive: boolean;
    notes: string | null;
    lastTriggeredAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
