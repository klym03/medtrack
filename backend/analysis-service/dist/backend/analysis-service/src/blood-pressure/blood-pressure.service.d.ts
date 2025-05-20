import { Repository } from 'typeorm';
import { BloodPressureReading } from '../../../../shared/models/blood-pressure-reading.entity';
import { CreateBloodPressureReadingDto, UpdateBloodPressureReadingDto } from './dto';
export declare class BloodPressureService {
    private readonly readingRepository;
    constructor(readingRepository: Repository<BloodPressureReading>);
    create(userIdFromJwt: string, createDto: CreateBloodPressureReadingDto): Promise<BloodPressureReading>;
    findAllByUser(userId: string): Promise<BloodPressureReading[]>;
    findOne(readingId: string, userIdFromJwt: string): Promise<BloodPressureReading>;
    update(readingId: string, userIdFromJwt: string, updateDto: UpdateBloodPressureReadingDto): Promise<BloodPressureReading>;
    remove(readingId: string, userIdFromJwt: string): Promise<void>;
}
