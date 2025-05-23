"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSourceOptions = void 0;
const typeorm_1 = require("typeorm");
const config_1 = require("@nestjs/config");
const dotenv_1 = require("dotenv");
const user_entity_1 = require("../../../shared/models/user.entity");
const analysis_entity_1 = require("../../../shared/models/analysis.entity");
const indicator_entity_1 = require("../../../shared/models/indicator.entity");
const blood_pressure_reading_entity_1 = require("../../../shared/models/blood-pressure-reading.entity");
const medication_entity_1 = require("../../../shared/models/medication.entity");
const medication_reminder_entity_1 = require("../../../shared/models/medication-reminder.entity");
(0, dotenv_1.config)({ path: '../../.env' });
const configService = new config_1.ConfigService();
const databaseUrl = configService.get('DATABASE_URL');
if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set in .env file for CLI');
}
const url = new URL(databaseUrl);
exports.dataSourceOptions = {
    type: 'postgres',
    host: url.hostname,
    port: parseInt(url.port, 10) || 5432,
    username: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    entities: [user_entity_1.User, analysis_entity_1.Analysis, indicator_entity_1.Indicator, blood_pressure_reading_entity_1.BloodPressureReading, medication_entity_1.Medication, medication_reminder_entity_1.MedicationReminder],
    synchronize: false,
    dropSchema: false,
    logging: true,
    migrationsTableName: 'typeorm_migrations_auth',
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
};
const dataSource = new typeorm_1.DataSource(exports.dataSourceOptions);
exports.default = dataSource;
//# sourceMappingURL=dataSource.js.map