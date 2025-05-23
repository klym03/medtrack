"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const models_1 = require("@shared/models");
const bcrypt = require("bcrypt");
let AuthService = AuthService_1 = class AuthService {
    constructor(userRepository, jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    sanitizeUser(user) {
        const { passwordHash, ...result } = user;
        return result;
    }
    async register(createUserDto) {
        const { email, password, ...rest } = createUserDto;
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUserEntity = this.userRepository.create({
            ...rest,
            email,
            passwordHash: hashedPassword,
            profileComplete: false,
        });
        const savedUser = await this.userRepository.save(newUserEntity);
        return this.sanitizeUser(savedUser);
    }
    async login(loginUserDto) {
        const { email, password } = loginUserDto;
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials - user not found');
        }
        const isPasswordMatching = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordMatching) {
            throw new common_1.UnauthorizedException('Invalid credentials - password mismatch');
        }
        const payload = { email: user.email, sub: user.id };
        const accessToken = this.jwtService.sign(payload);
        return { accessToken };
    }
    async validateUserById(userId) {
        return this.userRepository.findOne({ where: { id: userId } });
    }
    async getUserProfile(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const sanitizedUser = this.sanitizeUser(user);
        let age = null;
        if (user.dateOfBirth) {
            const birthDate = new Date(user.dateOfBirth);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
        }
        let bmi = null;
        if (user.heightCm && user.weightKg && user.heightCm > 0) {
            const heightInMeters = user.heightCm / 100;
            bmi = parseFloat((user.weightKg / (heightInMeters * heightInMeters)).toFixed(2));
        }
        return {
            ...sanitizedUser,
            age,
            bmi,
        };
    }
    async updateUserProfile(userId, updateUserProfileDto) {
        this.logger.log(`[updateUserProfile] Attempting to update profile for userId: ${userId}`);
        this.logger.debug(`[updateUserProfile] Received DTO: ${JSON.stringify(updateUserProfileDto)}`);
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            this.logger.warn(`[updateUserProfile] User not found for userId: ${userId}`);
            throw new common_1.NotFoundException('User not found');
        }
        this.logger.log(`[updateUserProfile] Found user: ${user.email} (ID: ${user.id})`);
        this.logger.debug(`[updateUserProfile] User before update: ${JSON.stringify(this.sanitizeUser(user))}`);
        Object.assign(user, updateUserProfileDto);
        this.logger.debug(`[updateUserProfile] User object after Object.assign: ${JSON.stringify(this.sanitizeUser(user))}`);
        const updatedUser = await this.userRepository.save(user);
        this.logger.log(`[updateUserProfile] User saved. Returned from repository: ${updatedUser.email} (ID: ${updatedUser.id})`);
        this.logger.debug(`[updateUserProfile] User after save: ${JSON.stringify(this.sanitizeUser(updatedUser))}`);
        let age = null;
        if (updatedUser.dateOfBirth) {
            const birthDate = new Date(updatedUser.dateOfBirth);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
        }
        let bmi = null;
        if (updatedUser.heightCm && updatedUser.weightKg && updatedUser.heightCm > 0) {
            const heightInMeters = updatedUser.heightCm / 100;
            bmi = parseFloat((updatedUser.weightKg / (heightInMeters * heightInMeters)).toFixed(2));
        }
        const sanitizedUpdatedUser = this.sanitizeUser(updatedUser);
        this.logger.log(`[updateUserProfile] Returning sanitized user: ${sanitizedUpdatedUser.email} (ID: ${sanitizedUpdatedUser.id})`);
        return {
            ...sanitizedUpdatedUser,
            age,
            bmi,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(models_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map