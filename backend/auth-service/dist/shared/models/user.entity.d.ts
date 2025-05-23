import { Analysis } from './analysis.entity';
import { BloodPressureReading } from './blood-pressure-reading.entity';
import { Medication } from './medication.entity';
import { MedicationReminder } from './medication-reminder.entity';
export declare class User {
    id: string;
    name: string | null;
    email: string;
    passwordHash: string;
    dateOfBirth: Date | null;
    sex: string | null;
    heightCm: number | null;
    weightKg: number | null;
    isSmoker: boolean | null;
    chronicConditions: string | null;
    currentMedications: string | null;
    profileComplete: boolean;
    usualSystolic: number | null;
    usualDiastolic: number | null;
    analyses: Analysis[];
    bloodPressureReadings: BloodPressureReading[];
    medications: Medication[];
    medicationReminders: MedicationReminder[];
    createdAt: Date;
    updatedAt: Date;
}
