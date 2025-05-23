"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfileContextModule = void 0;
const common_1 = require("@nestjs/common");
const user_profile_context_controller_1 = require("./user-profile-context.controller");
const user_profile_context_service_1 = require("./user-profile-context.service");
const typeorm_1 = require("@nestjs/typeorm");
const models_1 = require("@shared/models");
const auth_module_1 = require("./auth/auth.module");
let UserProfileContextModule = class UserProfileContextModule {
};
exports.UserProfileContextModule = UserProfileContextModule;
exports.UserProfileContextModule = UserProfileContextModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([models_1.User, models_1.Analysis, models_1.Indicator, models_1.BloodPressureReading]),
            auth_module_1.AuthModule,
        ],
        controllers: [user_profile_context_controller_1.UserProfileContextController],
        providers: [user_profile_context_service_1.UserProfileContextService]
    })
], UserProfileContextModule);
//# sourceMappingURL=user-profile-context.module.js.map