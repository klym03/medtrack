"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateIndicatorReferenceRangesTable1747820563521 = void 0;
class CreateIndicatorReferenceRangesTable1747820563521 {
    constructor() {
        this.name = 'CreateIndicatorReferenceRangesTable1747820563521';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TYPE "public"."indicator_reference_ranges_sexconstraint_enum" AS ENUM(
                'any',
                'male',
                'female'
            );
        `);
        await queryRunner.query(`
            CREATE TABLE "indicator_reference_ranges" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "indicatorName" character varying(255) NOT NULL,
                "units" character varying(50) NOT NULL,
                "sexConstraint" "public"."indicator_reference_ranges_sexconstraint_enum" NOT NULL DEFAULT 'any',
                "ageMinYears" integer,
                "ageMaxYears" integer,
                "normalLow" double precision,
                "normalHigh" double precision,
                "textualRange" text,
                "source" text,
                CONSTRAINT "PK_indicator_reference_ranges_id" PRIMARY KEY ("id") 
            );
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_indicator_range_unique" ON "indicator_reference_ranges" (
                "indicatorName",
                "units",
                "sexConstraint",
                "ageMinYears",
                "ageMaxYears"
            );
        `);
        await queryRunner.query(`
            COMMENT ON INDEX "public"."IDX_indicator_range_unique" IS 'Ensures each specific range is unique';
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "public"."IDX_indicator_range_unique"`);
        await queryRunner.query(`DROP TABLE "indicator_reference_ranges"`);
        await queryRunner.query(`DROP TYPE "public"."indicator_reference_ranges_sexconstraint_enum"`);
    }
}
exports.CreateIndicatorReferenceRangesTable1747820563521 = CreateIndicatorReferenceRangesTable1747820563521;
//# sourceMappingURL=1747820563521-CreateIndicatorReferenceRangesTable.js.map