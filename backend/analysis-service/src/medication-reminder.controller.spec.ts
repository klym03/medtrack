import { Test, TestingModule } from '@nestjs/testing';
import { MedicationReminderController } from './medication-reminder.controller';

describe('MedicationReminderController', () => {
  let controller: MedicationReminderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicationReminderController],
    }).compile();

    controller = module.get<MedicationReminderController>(MedicationReminderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
