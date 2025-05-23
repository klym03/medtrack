import { User } from './user.entity';
import { MedicationReminder } from './medication-reminder.entity';
export declare class Medication {
    id: string;
    user: User;
    name: string;
    dosage: string | null;
    frequency: string | null;
    startDate: Date | null;
    endDate: Date | null;
    notes: string | null;
    reminders: MedicationReminder[];
    createdAt: Date;
    updatedAt: Date;
}
