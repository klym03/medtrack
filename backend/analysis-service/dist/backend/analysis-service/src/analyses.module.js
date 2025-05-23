"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysesModule = void 0;
const common_1 = require("@nestjs/common");
const analyses_service_1 = require("./analyses/analyses.service");
const analyses_controller_1 = require("./analyses/analyses.controller");
const typeorm_1 = require("@nestjs/typeorm");
const analysis_entity_1 = require("../../../shared/models/analysis.entity");
const indicator_entity_1 = require("../../../shared/models/indicator.entity");
const user_entity_1 = require("../../../shared/models/user.entity");
const indicator_reference_range_entity_1 = require("../../../shared/models/indicator-reference-range.entity");
const blood_pressure_reading_entity_1 = require("../../../shared/models/blood-pressure-reading.entity");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const jwt_strategy_1 = require("./jwt.strategy");
let AnalysesModule = class AnalysesModule {
};
exports.AnalysesModule = AnalysesModule;
exports.AnalysesModule = AnalysesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([analysis_entity_1.Analysis, indicator_entity_1.Indicator, user_entity_1.User, indicator_reference_range_entity_1.IndicatorReferenceRange, blood_pressure_reading_entity_1.BloodPressureReading]),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => {
                    const secret = configService.get('JWT_SECRET');
                    if (!secret) {
                        throw new Error('JWT_SECRET is not configured in environment variables.');
                    }
                    return {
                        secret: secret,
                        signOptions: {
                            expiresIn: configService.get('JWT_EXPIRES_IN', '3600s'),
                        },
                    };
                },
                inject: [config_1.ConfigService],
            }),
            config_1.ConfigModule,
        ],
        providers: [analyses_service_1.AnalysesService, jwt_strategy_1.JwtStrategy],
        controllers: [analyses_controller_1.AnalysesController],
        exports: [analyses_service_1.AnalysesService, jwt_strategy_1.JwtStrategy]
    })
], AnalysesModule);
//# sourceMappingURL=analyses.module.js.map