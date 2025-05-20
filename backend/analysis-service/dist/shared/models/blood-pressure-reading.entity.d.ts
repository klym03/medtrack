import { User } from './user.entity';
export declare class BloodPressureReading {
    id: string;
    userId: string;
    user: User;
    timestamp: Date;
    systolic: number;
    diastolic: number;
}
