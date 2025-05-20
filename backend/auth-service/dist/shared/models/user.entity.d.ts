import { Analysis } from './analysis.entity';
import { BloodPressureReading } from './blood-pressure-reading.entity';
export declare class User {
    id: string;
    name: string | null;
    email: string;
    passwordHash: string;
    dateOfBirth: Date | null;
    sex: string | null;
    heightCm: number | null;
    weightKg: number | null;
    isSmoker: string | null;
    chronicConditions: string | null;
    currentMedications: string | null;
    profileComplete: boolean;
    usualSystolic: number | null;
    usualDiastolic: number | null;
    analyses: Analysis[];
    bloodPressureReadings: BloodPressureReading[];
    createdAt: Date;
    updatedAt: Date;
}
