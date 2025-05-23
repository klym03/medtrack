export declare class UpdateUserProfileDto {
    name?: string;
    dateOfBirth?: string;
    sex?: 'Male' | 'Female' | 'Other' | 'PreferNotToSay';
    heightCm?: number;
    weightKg?: number;
    usualSystolic?: number;
    usualDiastolic?: number;
    isSmoker?: boolean;
    chronicConditions?: string;
    currentMedications?: string;
}
