"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisModule = void 0;
const common_1 = require("@nestjs/common");
const analysis_service_1 = require("./analysis.service");
const analysis_controller_1 = require("./analysis.controller");
const typeorm_1 = require("@nestjs/typeorm");
const models_1 = require("../../../shared/models/index.js");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const jwt_strategy_1 = require("./jwt.strategy");
let AnalysisModule = class AnalysisModule {
};
exports.AnalysisModule = AnalysisModule;
exports.AnalysisModule = AnalysisModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([models_1.Analysis, models_1.Indicator, models_1.User]),
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
        ],
        providers: [analysis_service_1.AnalysisService, jwt_strategy_1.JwtStrategy],
        controllers: [analysis_controller_1.AnalysisController],
        exports: [analysis_service_1.AnalysisService, jwt_strategy_1.JwtStrategy]
    })
], AnalysisModule);
//# sourceMappingURL=analysis.module.js.map