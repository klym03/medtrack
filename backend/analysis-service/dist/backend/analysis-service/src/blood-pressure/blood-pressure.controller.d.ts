import { BloodPressureService } from './blood-pressure.service';
import { CreateBloodPressureReadingDto, UpdateBloodPressureReadingDto } from './dto';
import { BloodPressureReading } from '../../../../shared/models/blood-pressure-reading.entity';
export declare class BloodPressureController {
    private readonly bpService;
    constructor(bpService: BloodPressureService);
    create(req: any, createDto: CreateBloodPressureReadingDto): Promise<BloodPressureReading>;
    findAllMyReadings(req: any): Promise<BloodPressureReading[]>;
    findOne(readingId: string, req: any): Promise<BloodPressureReading>;
    update(readingId: string, req: any, updateDto: UpdateBloodPressureReadingDto): Promise<BloodPressureReading>;
    remove(readingId: string, req: any): Promise<void>;
}
