import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Recommendation } from './recommendations/entities/recommendation.entity';

// Завантажуємо змінні середовища з .env файлу, що знаходиться на два рівні вище
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') }); 
// Потрібно уточнити точний відносний шлях від dist/src до .env в medassist-nodejs
// Якщо dataSource.ts буде в src, то при компіляції в dist/src шлях буде ../../../../.env
// Якщо запускати ts-node з src, то шлях буде ../../.env
// Краще покластися на те, що ConfigService вже завантажив змінні з правильного місця, якщо це можливо
// Або передавати DATABASE_URL через CLI команди для міграцій.

// Для простоти зараз спробуємо так, але це може потребувати коригування шляху до .env
const configService = new ConfigService(); 
const databaseUrl = configService.get<string>('DATABASE_URL');

if (!databaseUrl) {
  throw new Error('DataSource Error: DATABASE_URL environment variable is not set. Make sure .env is loaded correctly for CLI operations.');
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: databaseUrl,
  entities: [Recommendation],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false, // Для CLI synchronize завжди має бути false, міграції керують схемою
  // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined, // Якщо потрібно для CLI
  logging: ['error'], // Логування для CLI
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource; 