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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const models_1 = require("../../../shared/models/index.js");
const bcrypt = require("bcrypt");
let AuthService = class AuthService {
    constructor(userRepository, jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
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
        return this.sanitizeUser(user);
    }
    async updateUserProfile(userId, updateUserProfileDto) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        Object.assign(user, updateUserProfileDto);
        const updatedUser = await this.userRepository.save(user);
        return this.sanitizeUser(updatedUser);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(models_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map