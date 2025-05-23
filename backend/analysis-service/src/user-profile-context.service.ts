import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, Analysis, Indicator, BloodPressureReading } from '@shared/models';
import { Repository } from 'typeorm';
import { UserProfileContextResponseDto } from './dto';
import * as jsonc from 'jsonc-parser'; // Для парсингу JSON з можливими коментарями
import * as moment from 'moment';

@Injectable()
export class UserProfileContextService {
  private readonly logger = new Logger(UserProfileContextService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Analysis)
    private readonly analysisRepository: Repository<Analysis>,
    @InjectRepository(Indicator)
    private readonly indicatorRepository: Repository<Indicator>,
    @InjectRepository(BloodPressureReading)
    private readonly bpReadingRepository: Repository<BloodPressureReading>,
  ) {}

  private calcAge(birthDate: Date | string | null): number | null {
    if (!birthDate) return null;
    return moment().diff(moment(birthDate), 'years');
  }

  private calcBmi(heightCm: number | null, weightKg: number | null): number | null {
    if (!heightCm || !weightKg || heightCm <= 0) return null;
    try {
      const heightM = heightCm / 100;
      return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
    } catch {
      return null;
    }
  }

  private getDeviationStatus(valueStr: string | null, referenceStr: string | null): string {
    if (valueStr === null || valueStr === undefined || referenceStr === null || referenceStr === undefined) {
        return 'normal';
    }

    const parseValue = (val: string): number | null => {
        try {
            const cleaned = String(val).replace(/,/g, '.').replace(/[^0-9.-]/g, '');
            const num = parseFloat(cleaned);
            return isNaN(num) ? null : num;
        } catch {
            return null;
        }
    };

    const value = parseValue(valueStr);
    if (value === null) return 'normal';

    const ref = String(referenceStr).trim().replace(/,/g, '.');

    const rangeMatch = ref.match(/^(-?\d+(?:\.\d+)?)\s*[-–—]\s*(-?\d+(?:\.\d+)?)/);
    if (rangeMatch) {
        const low = parseFloat(rangeMatch[1]);
        const high = parseFloat(rangeMatch[2]);
        if (isNaN(low) || isNaN(high)) return 'normal';
        if (value < low) return 'low';
        if (value > high) return 'high';
        return 'normal';
    }

    const ltMatch = ref.match(/^[<≤< Inferior a Inferior à]\s*(-?\d+(?:\.\d+)?)/i);
    if (ltMatch) {
        const threshold = parseFloat(ltMatch[1]);
        if (isNaN(threshold)) return 'normal';
        return value >= threshold ? 'high' : 'normal'; // Зверніть увагу: >= для < threshold
    }

    const gtMatch = ref.match(/^[>≥> Superior a Superior à]\s*(-?\d+(?:\.\d+)?)/i);
    if (gtMatch) {
        const threshold = parseFloat(gtMatch[1]);
        if (isNaN(threshold)) return 'normal';
        return value <= threshold ? 'low' : 'normal'; // Зверніть увагу: <= для > threshold
    }
    // Спроба для формату типу "до 5.2"
    const upToMatch = ref.match(/^(?:до|до )\s*(-?\d+(?:\.\d+)?)/i);
    if (upToMatch) {
        const threshold = parseFloat(upToMatch[1]);
        if (isNaN(threshold)) return 'normal';
        return value > threshold ? 'high' : 'normal';
    }

    return 'normal';
  }

  private async buildLatestIndicatorsSummary(userId: string, maxItems = 100): Promise<string | null> {
    const latestAnalysis = await this.analysisRepository.findOne({
      where: { userId },
      order: { uploadTimestamp: 'DESC' },
    });
    if (!latestAnalysis || !latestAnalysis.rawResultText) return null;

    try {
      const parseErrors: jsonc.ParseError[] = [];
      const data = jsonc.parse(latestAnalysis.rawResultText, parseErrors);
      if (parseErrors.length > 0) {
        this.logger.warn(`JSON parse errors in rawResultText for analysis ${latestAnalysis.id}: ${parseErrors.map(e => e.error).join('; ')}`);
        // Пробуємо витягти "показники" навіть з помилками, якщо це можливо
      }

      const indicators = data?.['показники'];
      if (!indicators || !Array.isArray(indicators)) return null;

      const abnormal: string[] = [];
      for (const item of indicators.slice(0, maxItems)) {
        if (typeof item !== 'object' || item === null) continue;
        const name = item['назва'];
        const value = item['значення'];
        const units = item['одиниці'];
        const ref = item['референс'];

        if (name === undefined || value === undefined) continue;
        
        const status = this.getDeviationStatus(String(value), ref ? String(ref) : null);
        if (status === 'high' || status === 'low') {
          const dirWord = status === 'high' ? 'вище' : 'нижче';
          const valPart = `${value}${units ? ' ' + units : ''}`.trim();
          abnormal.push(`${name}: ${valPart} (${dirWord} норми)`);
        }
      }
      if (abnormal.length > 0) return `Відхилення в останньому аналізі: ${abnormal.join('; ')}`;
      return 'Усі показники останнього аналізу в межах референсних значень.';
    } catch (error) {
      this.logger.error(`Error parsing or processing indicators for analysis ${latestAnalysis.id}: ${error}`, error.stack);
      return 'Помилка обробки даних останнього аналізу.';
    }
  }

  private async buildAllIndicatorsSummary(userId: string, maxItemsPerAnalysis = 100): Promise<string | null> {
    const analyses = await this.analysisRepository.find({
      where: { userId },
      order: { uploadTimestamp: 'DESC' },
    });
    if (!analyses || analyses.length === 0) return 'Дані аналізів відсутні.';

    const abnormal: string[] = [];
    for (const an of analyses) {
      if (!an.rawResultText) continue;
      try {
        const parseErrors: jsonc.ParseError[] = [];
        const data = jsonc.parse(an.rawResultText, parseErrors);
        if (parseErrors.length > 0) {
             this.logger.warn(`JSON parse errors in rawResultText for (all) analysis ${an.id}: ${parseErrors.map(e => e.error).join('; ')}`);
        }

        const indicators = data?.['показники'];
        if (!indicators || !Array.isArray(indicators)) continue;

        for (const item of indicators.slice(0, maxItemsPerAnalysis)) {
          if (typeof item !== 'object' || item === null) continue;
          const name = item['назва'];
          const value = item['значення'];
          const units = item['одиниці'];
          const ref = item['референс'];

          if (name === undefined || value === undefined) continue;

          const status = this.getDeviationStatus(String(value), ref ? String(ref) : null);
          if (status === 'high' || status === 'low') {
            const dirWord = status === 'high' ? 'вище' : 'нижче';
            const valPart = `${value}${units ? ' ' + units : ''}`.trim();
            abnormal.push(`${name}: ${valPart} (${dirWord} норми)`);
          }
        }
      } catch (error) {
        this.logger.error(`Error parsing/processing indicators for (all) analysis ${an.id}: ${error}`, error.stack);
      }
    }

    if (abnormal.length > 0) {
      const seen = new Set<string>();
      const uniqueAbnormal = abnormal.filter(item => {
        if (seen.has(item)) return false;
        seen.add(item);
        return true;
      });
      return `Відхилення у ваших аналізах: ${uniqueAbnormal.join('; ')}`;
    }
    return 'Всі показники у наявних аналізах у межах референсних значень.';
  }

  async getUserProfileContext(userId: string, includeAllAnalyses: boolean): Promise<UserProfileContextResponseDto> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }

    const lastBpReading = await this.bpReadingRepository.findOne({
      where: { userId },
      order: { timestamp: 'DESC' },
    });

    const indicatorsSummary = await this.buildLatestIndicatorsSummary(userId);
    const allIndicatorsSummary = await this.buildAllIndicatorsSummary(userId);

    const context: UserProfileContextResponseDto = {
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
        raw_result_text: a.rawResultText, // Передаємо повний raw текст, як у Flask
      }));
    }
    return context;
  }
}
