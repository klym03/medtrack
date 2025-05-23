import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOriginalNameMimeTypeSizeToAnalysis1747818210138 implements MigrationInterface {
    name = 'AddOriginalNameMimeTypeSizeToAnalysis1747818210138'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "analyses" ADD "originalName" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "analyses" ADD "mimeType" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "analyses" ADD "size" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "analyses" DROP COLUMN "size"`);
        await queryRunner.query(`ALTER TABLE "analyses" DROP COLUMN "mimeType"`);
        await queryRunner.query(`ALTER TABLE "analyses" DROP COLUMN "originalName"`);
    }

}
