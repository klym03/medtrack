import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddOriginalNameMimeTypeSizeToAnalysis1747818210138 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
