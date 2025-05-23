"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../../../shared/models/user.entity");
const analysis_entity_1 = require("../../../shared/models/analysis.entity");
const indicator_entity_1 = require("../../../shared/models/indicator.entity");
const blood_pressure_reading_entity_1 = require("../../../shared/models/blood-pressure-reading.entity");
const medication_entity_1 = require("../../../shared/models/medication.entity");
const medication_reminder_entity_1 = require("../../../shared/models/medication-reminder.entity");
const indicator_reference_range_entity_1 = require("../../../shared/models/indicator-reference-range.entity");
const analyses_module_1 = require("./analyses.module");
const blood_pressure_module_1 = require("./blood-pressure/blood-pressure.module");
const medication_module_1 = require("./medication/medication.module");
const medication_reminder_module_1 = require("./medication-reminder.module");
const user_profile_context_module_1 = require("./user-profile-context.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '../../.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    const databaseUrl = configService.get('DATABASE_URL');
                    if (!databaseUrl) {
                        throw new Error('DATABASE_URL environment variable is not set for analysis service');
                    }
                    const url = new URL(databaseUrl);
                    return {
                        type: 'postgres',
                        host: url.hostname,
                        port: parseInt(url.port, 10) || 5432,
                        username: url.username,
                        password: url.password,
                        database: url.pathname.slice(1),
                        entities: [user_entity_1.User, analysis_entity_1.Analysis, indicator_entity_1.Indicator, blood_pressure_reading_entity_1.BloodPressureReading, medication_entity_1.Medication, medication_reminder_entity_1.MedicationReminder, indicator_reference_range_entity_1.IndicatorReferenceRange],
                        synchronize: false,
                        dropSchema: false,
                        logging: true,
                    };
                },
                inject: [config_1.ConfigService],
            }),
            analyses_module_1.AnalysesModule,
            blood_pressure_module_1.BloodPressureModule,
            medication_module_1.MedicationModule,
            medication_reminder_module_1.MedicationReminderModule,
            user_profile_context_module_1.UserProfileContextModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map