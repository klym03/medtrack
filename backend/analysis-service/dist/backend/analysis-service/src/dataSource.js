"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const models_1 = require("@shared/models");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
const getOrmConfig = () => {
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
        entities: [models_1.User, models_1.Analysis, models_1.Indicator, models_1.BloodPressureReading, models_1.Medication, models_1.MedicationReminder, models_1.IndicatorReferenceRange],
        migrations: ['src/migrations/*.ts'],
        migrationsTableName: 'typeorm_migrations_analysis_service',
    };
};
const AppDataSource = new typeorm_1.DataSource(getOrmConfig());
exports.default = AppDataSource;
//# sourceMappingURL=dataSource.js.map