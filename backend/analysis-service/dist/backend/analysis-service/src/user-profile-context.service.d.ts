import { User, Analysis, Indicator, BloodPressureReading } from '@shared/models';
import { Repository } from 'typeorm';
import { UserProfileContextResponseDto } from './dto';
export declare class UserProfileContextService {
    private readonly userRepository;
    private readonly analysisRepository;
    private readonly indicatorRepository;
    private readonly bpReadingRepository;
    private readonly logger;
    constructor(userRepository: Repository<User>, analysisRepository: Repository<Analysis>, indicatorRepository: Repository<Indicator>, bpReadingRepository: Repository<BloodPressureReading>);
    private calcAge;
    private calcBmi;
    private getDeviationStatus;
    private buildLatestIndicatorsSummary;
    private buildAllIndicatorsSummary;
    getUserProfileContext(userId: string, includeAllAnalyses: boolean): Promise<UserProfileContextResponseDto>;
}
