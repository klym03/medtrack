import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreateIndicatorReferenceRangesTable1747820563521 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
