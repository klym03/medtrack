import { MigrationInterface, QueryRunner } from "typeorm";
export declare class InitialSchema1747833725199 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
