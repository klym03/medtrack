import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv'; // Щоб завантажити .env файл
import { User } from '@shared/models/user.entity';
import { Analysis } from '@shared/models/analysis.entity';
import { Indicator } from '@shared/models/indicator.entity';
import { BloodPressureReading } from '@shared/models/blood-pressure-reading.entity';
import { Medication } from '@shared/models/medication.entity';
import { MedicationReminder } from '@shared/models/medication-reminder.entity';

// Завантажуємо змінні середовища з файлу .env
// Шлях відносно поточної директорії dataSource.ts (src/)
config({ path: '../../.env' }); 

const configService = new ConfigService();
const databaseUrl = configService.get<string>('DATABASE_URL');

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set in .env file for CLI');
}

const url = new URL(databaseUrl);

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: url.hostname,
  port: parseInt(url.port, 10) || 5432,
  username: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  entities: [User, Analysis, Indicator, BloodPressureReading, Medication, MedicationReminder],
  synchronize: false, 
  dropSchema: false,
  logging: true, 
  migrationsTableName: 'typeorm_migrations_auth', // Рекомендується окрема таблиця для міграцій кожного сервісу
  migrations: [__dirname + '/migrations/*{.ts,.js}'], // Шлях до міграцій
  // ssl: configService.get('DATABASE_SSL') === 'true' ? { rejectUnauthorized: false } : undefined,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource; 