import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medication } from '@shared/models/medication.entity';
import { User } from '@shared/models/user.entity';
import { CreateMedicationDto, UpdateMedicationDto } from '../dto';

@Injectable()
export class MedicationService {
  constructor(
    @InjectRepository(Medication)
    private readonly medicationRepository: Repository<Medication>,
    // @InjectRepository(User) // User repository can be removed if not directly used for other checks
    // private readonly userRepository: Repository<User>,
  ) {}

  async create(createMedicationDto: CreateMedicationDto, userFromJwt: User): Promise<Medication> {
    const newMedication = this.medicationRepository.create({
      ...createMedicationDto,
      user: userFromJwt, // Assign the user object directly to the relation
    });
    return this.medicationRepository.save(newMedication);
  }

  async findAllByUser(userId: string): Promise<Medication[]> {
    // Querying by userId still works as TypeORM understands the relation
    return this.medicationRepository.find({ where: { user: { id: userId } } });
  }

  async findOneById(id: string, userId: string): Promise<Medication> {
    const medication = await this.medicationRepository.findOne({ where: { id, user: { id: userId } } });
    if (!medication) {
      throw new NotFoundException(`Medication with ID "${id}" not found for this user.`);
    }
    return medication;
  }

  async update(id: string, updateMedicationDto: UpdateMedicationDto, userId: string): Promise<Medication> {
    // findOneById already ensures the medication belongs to the user
    const medicationToUpdate = await this.findOneById(id, userId); 
    
    const updatedMedication = await this.medicationRepository.preload({
        id: medicationToUpdate.id, 
        ...updateMedicationDto,
        // user field is not updated here, it's fixed by ownership
    });

    if (!updatedMedication) {
        throw new NotFoundException(`Medication with ID "${id}" could not be preloaded for update.`);
    }

    return this.medicationRepository.save(updatedMedication);
  }

  async remove(id: string, userId: string): Promise<void> {
    const medication = await this.findOneById(id, userId); 
    const result = await this.medicationRepository.delete(medication.id);
    if (result.affected === 0) {
      throw new NotFoundException(`Medication with ID "${id}" not found or already deleted.`);
    }
  }
} 