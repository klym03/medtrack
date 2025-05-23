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
var UserProfileContextService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfileContextService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const models_1 = require("@shared/models");
const typeorm_2 = require("typeorm");
const jsonc = require("jsonc-parser");
const moment = require("moment");
let UserProfileContextService = UserProfileContextService_1 = class UserProfileContextService {
    constructor(userRepository, analysisRepository, indicatorRepository, bpReadingRepository) {
        this.userRepository = userRepository;
        this.analysisRepository = analysisRepository;
        this.indicatorRepository = indicatorRepository;
        this.bpReadingRepository = bpReadingRepository;
        this.logger = new common_1.Logger(UserProfileContextService_1.name);
    }
    calcAge(birthDate) {
        if (!birthDate)
            return null;
        return moment().diff(moment(birthDate), 'years');
    }
    calcBmi(heightCm, weightKg) {
        if (!heightCm || !weightKg || heightCm <= 0)
            return null;
        try {
            const heightM = heightCm / 100;
            return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
        }
        catch {
            return null;
        }
    }
    getDeviationStatus(valueStr, referenceStr) {
        if (valueStr === null || valueStr === undefined || referenceStr === null || referenceStr === undefined) {
            return 'normal';
        }
        const parseValue = (val) => {
            try {
                const cleaned = String(val).replace(/,/g, '.').replace(/[^0-9.-]/g, '');
                const num = parseFloat(cleaned);
                return isNaN(num) ? null : num;
            }
            catch {
                return null;
            }
        };
        const value = parseValue(valueStr);
        if (value === null)
            return 'normal';
        const ref = String(referenceStr).trim().replace(/,/g, '.');
        const rangeMatch = ref.match(/^(-?\d+(?:\.\d+)?)\s*[-–—]\s*(-?\d+(?:\.\d+)?)/);
        if (rangeMatch) {
            const low = parseFloat(rangeMatch[1]);
            const high = parseFloat(rangeMatch[2]);
            if (isNaN(low) || isNaN(high))
                return 'normal';
            if (value < low)
                return 'low';
            if (value > high)
                return 'high';
            return 'normal';
        }
        const ltMatch = ref.match(/^[<≤< Inferior a Inferior à]\s*(-?\d+(?:\.\d+)?)/i);
        if (ltMatch) {
            const threshold = parseFloat(ltMatch[1]);
            if (isNaN(threshold))
                return 'normal';
            return value >= threshold ? 'high' : 'normal';
        }
        const gtMatch = ref.match(/^[>≥> Superior a Superior à]\s*(-?\d+(?:\.\d+)?)/i);
        if (gtMatch) {
            const threshold = parseFloat(gtMatch[1]);
            if (isNaN(threshold))
                return 'normal';
            return value <= threshold ? 'low' : 'normal';
        }
        const upToMatch = ref.match(/^(?:до|до )\s*(-?\d+(?:\.\d+)?)/i);
        if (upToMatch) {
            const threshold = parseFloat(upToMatch[1]);
            if (isNaN(threshold))
                return 'normal';
            return value > threshold ? 'high' : 'normal';
        }
        return 'normal';
    }
    async buildLatestIndicatorsSummary(userId, maxItems = 100) {
        const latestAnalysis = await this.analysisRepository.findOne({
            where: { userId },
            order: { uploadTimestamp: 'DESC' },
        });
        if (!latestAnalysis || !latestAnalysis.rawResultText)
            return null;
        try {
            const parseErrors = [];
            const data = jsonc.parse(latestAnalysis.rawResultText, parseErrors);
            if (parseErrors.length > 0) {
                this.logger.warn(`JSON parse errors in rawResultText for analysis ${latestAnalysis.id}: ${parseErrors.map(e => e.error).join('; ')}`);
            }
            const indicators = data?.['показники'];
            if (!indicators || !Array.isArray(indicators))
                return null;
            const abnormal = [];
            for (const item of indicators.slice(0, maxItems)) {
                if (typeof item !== 'object' || item === null)
                    continue;
                const name = item['назва'];
                const value = item['значення'];
                const units = item['одиниці'];
                const ref = item['референс'];
                if (name === undefined || value === undefined)
                    continue;
                const status = this.getDeviationStatus(String(value), ref ? String(ref) : null);
                if (status === 'high' || status === 'low') {
                    const dirWord = status === 'high' ? 'вище' : 'нижче';
                    const valPart = `${value}${units ? ' ' + units : ''}`.trim();
                    abnormal.push(`${name}: ${valPart} (${dirWord} норми)`);
                }
            }
            if (abnormal.length > 0)
                return `Відхилення в останньому аналізі: ${abnormal.join('; ')}`;
            return 'Усі показники останнього аналізу в межах референсних значень.';
        }
        catch (error) {
            this.logger.error(`Error parsing or processing indicators for analysis ${latestAnalysis.id}: ${error}`, error.stack);
            return 'Помилка обробки даних останнього аналізу.';
        }
    }
    async buildAllIndicatorsSummary(userId, maxItemsPerAnalysis = 100) {
        const analyses = await this.analysisRepository.find({
            where: { userId },
            order: { uploadTimestamp: 'DESC' },
        });
        if (!analyses || analyses.length === 0)
            return 'Дані аналізів відсутні.';
        const abnormal = [];
        for (const an of analyses) {
            if (!an.rawResultText)
                continue;
            try {
                const parseErrors = [];
                const data = jsonc.parse(an.rawResultText, parseErrors);
                if (parseErrors.length > 0) {
                    this.logger.warn(`JSON parse errors in rawResultText for (all) analysis ${an.id}: ${parseErrors.map(e => e.error).join('; ')}`);
                }
                const indicators = data?.['показники'];
                if (!indicators || !Array.isArray(indicators))
                    continue;
                for (const item of indicators.slice(0, maxItemsPerAnalysis)) {
                    if (typeof item !== 'object' || item === null)
                        continue;
                    const name = item['назва'];
                    const value = item['значення'];
                    const units = item['одиниці'];
                    const ref = item['референс'];
                    if (name === undefined || value === undefined)
                        continue;
                    const status = this.getDeviationStatus(String(value), ref ? String(ref) : null);
                    if (status === 'high' || status === 'low') {
                        const dirWord = status === 'high' ? 'вище' : 'нижче';
                        const valPart = `${value}${units ? ' ' + units : ''}`.trim();
                        abnormal.push(`${name}: ${valPart} (${dirWord} норми)`);
                    }
                }
            }
            catch (error) {
                this.logger.error(`Error parsing/processing indicators for (all) analysis ${an.id}: ${error}`, error.stack);
            }
        }
        if (abnormal.length > 0) {
            const seen = new Set();
            const uniqueAbnormal = abnormal.filter(item => {
                if (seen.has(item))
                    return false;
                seen.add(item);
                return true;
            });
            return `Відхилення у ваших аналізах: ${uniqueAbnormal.join('; ')}`;
        }
        return 'Всі показники у наявних аналізах у межах референсних значень.';
    }
    async getUserProfileContext(userId, includeAllAnalyses) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new common_1.NotFoundException('Користувача не знайдено');
        }
        const lastBpReading = await this.bpReadingRepository.findOne({
            where: { userId },
            order: { timestamp: 'DESC' },
        });
        const indicatorsSummary = await this.buildLatestIndicatorsSummary(userId);
        const allIndicatorsSummary = await this.buildAllIndicatorsSummary(userId);
        const context = {
            name: user.name,
            email: user.email,
            age: this.calcAge(user.dateOfBirth),
            sex: user.sex,
            height_cm: user.heightCm,
            weight_kg: user.weightKg,
            bmi: this.calcBmi(user.heightCm, user.weightKg),
            is_smoker: user.isSmoker === null ? null : String(user.isSmoker),
            usual_systolic: user.usualSystolic,
            usual_diastolic: user.usualDiastolic,
            last_bp: lastBpReading ? {
                systolic: lastBpReading.systolic,
                diastolic: lastBpReading.diastolic,
                timestamp: lastBpReading.timestamp.toISOString(),
            } : { systolic: null, diastolic: null, timestamp: null },
            indicators_summary: indicatorsSummary,
            chronic_conditions: user.chronicConditions,
            current_medications: user.currentMedications,
            all_indicators_summary: allIndicatorsSummary,
        };
        if (includeAllAnalyses) {
            const allAnalysesRecords = await this.analysisRepository.find({
                where: { userId },
                order: { uploadTimestamp: 'DESC' },
            });
            context.all_analyses = allAnalysesRecords.map(a => ({
                id: a.id,
                type: a.documentType,
                analysis_date: a.analysisDate ? (moment(a.analysisDate, ['YYYY-MM-DD', 'DD.MM.YYYY', 'DD/MM/YYYY']).isValid() ? moment(a.analysisDate, ['YYYY-MM-DD', 'DD.MM.YYYY', 'DD/MM/YYYY']).format('YYYY-MM-DD') : a.analysisDate) : null,
                uploaded: a.uploadTimestamp.toISOString(),
                filename: a.filename,
                raw_result_text: a.rawResultText,
            }));
        }
        return context;
    }
};
exports.UserProfileContextService = UserProfileContextService;
exports.UserProfileContextService = UserProfileContextService = UserProfileContextService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(models_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(models_1.Analysis)),
    __param(2, (0, typeorm_1.InjectRepository)(models_1.Indicator)),
    __param(3, (0, typeorm_1.InjectRepository)(models_1.BloodPressureReading)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UserProfileContextService);
//# sourceMappingURL=user-profile-context.service.js.map