"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddOriginalNameMimeTypeSizeToAnalysis1747818210138 = void 0;
class AddOriginalNameMimeTypeSizeToAnalysis1747818210138 {
    constructor() {
        this.name = 'AddOriginalNameMimeTypeSizeToAnalysis1747818210138';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "analyses" ADD "originalName" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "analyses" ADD "mimeType" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "analyses" ADD "size" integer`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "analyses" DROP COLUMN "size"`);
        await queryRunner.query(`ALTER TABLE "analyses" DROP COLUMN "mimeType"`);
        await queryRunner.query(`ALTER TABLE "analyses" DROP COLUMN "originalName"`);
    }
}
exports.AddOriginalNameMimeTypeSizeToAnalysis1747818210138 = AddOriginalNameMimeTypeSizeToAnalysis1747818210138;
//# sourceMappingURL=1747818210138-AddOriginalNameMimeTypeSizeToAnalysis.js.map