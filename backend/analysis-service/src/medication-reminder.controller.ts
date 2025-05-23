import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { MedicationReminderService } from './medication-reminder.service';
import { CreateMedicationReminderDto, UpdateMedicationReminderDto } from './dto';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'; // Path might need adjustment
import { User as UserEntity } from '@shared/models'; // To avoid conflict with req.user

@UseGuards(JwtAuthGuard)
@Controller('medication-reminders') // Pluralized route
export class MedicationReminderController {
  constructor(private readonly reminderService: MedicationReminderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Req() req: { user: UserEntity }, @Body() createReminderDto: CreateMedicationReminderDto) {
    return this.reminderService.create(req.user.id, createReminderDto);
  }

  @Get()
  findAll(@Req() req: { user: UserEntity }) {
    return this.reminderService.findAllForUser(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req: { user: UserEntity }, @Param('id', ParseUUIDPipe) id: string) {
    return this.reminderService.findOneForUser(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Req() req: { user: UserEntity }, 
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateReminderDto: UpdateMedicationReminderDto
  ) {
    return this.reminderService.update(req.user.id, id, updateReminderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Req() req: { user: UserEntity }, @Param('id', ParseUUIDPipe) id: string) {
    return this.reminderService.remove(req.user.id, id);
  }
}
