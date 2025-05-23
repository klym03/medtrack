import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { MedicationService } from './medication.service';
import { CreateMedicationDto, UpdateMedicationDto } from '../dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Assuming common auth guard location
import { Medication } from '@shared/models/medication.entity';

@UseGuards(JwtAuthGuard)
@Controller('medications')
export class MedicationController {
  constructor(private readonly medicationService: MedicationService) {}

  @Post()
  async create(@Body() createMedicationDto: CreateMedicationDto, @Request() req): Promise<Medication> {
    // req.user is populated by JwtAuthGuard and contains the user object (e.g., from JwtStrategy validate)
    const userFromJwt = req.user; 
    return this.medicationService.create(createMedicationDto, userFromJwt);
  }

  @Get()
  async findAllByUser(@Request() req): Promise<Medication[]> {
    const userId = req.user.id;
    return this.medicationService.findAllByUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req): Promise<Medication> {
    const userId = req.user.id;
    return this.medicationService.findOneById(id, userId);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMedicationDto: UpdateMedicationDto,
    @Request() req,
  ): Promise<Medication> {
    const userId = req.user.id;
    return this.medicationService.update(id, updateMedicationDto, userId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req): Promise<void> {
    const userId = req.user.id;
    return this.medicationService.remove(id, userId);
  }
} 