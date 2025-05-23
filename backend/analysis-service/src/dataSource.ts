import { DataSource, DataSourceOptions } from 'typeorm';
import { User, Analysis, Indicator, BloodPressureReading, Medication, MedicationReminder, IndicatorReferenceRange } from '@shared/models';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file from the project root relative to this dataSource.ts file
// Assumes .env is three levels up from medassist-nodejs/backend/analysis-service/src
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const getOrmConfig = (): DataSourceOptions => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set (dataSource.ts for analysis-service)');
  }
  const url = new URL(databaseUrl);

  return {
    type: 'postgres',
    host: url.hostname,
    port: parseInt(url.port, 10) || 5432,
    username: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    entities: [User, Analysis, Indicator, BloodPressureReading, Medication, MedicationReminder, IndicatorReferenceRange],
    // migrations will be sought in 'src/migrations' and TypeORM CLI will compile them
    migrations: ['src/migrations/*.ts'], 
    migrationsTableName: 'typeorm_migrations_analysis_service',
    // It's good practice to set naming strategy if you use one, e.g., new SnakeNamingStrategy()
    // namingStrategy: new SnakeNamingStrategy(), // Example if you use snake_case for table/column names
  };
};

const AppDataSource = new DataSource(getOrmConfig());

export default AppDataSource; 