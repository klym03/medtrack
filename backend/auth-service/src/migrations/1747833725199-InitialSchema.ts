import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1747833725199 implements MigrationInterface {
    name = 'InitialSchema1747833725199'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "indicators" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "analysisId" uuid NOT NULL, "name" character varying(255) NOT NULL, "value" character varying(100), "units" character varying(50), "referenceRange" character varying(100), CONSTRAINT "PK_6e24383c110600564187e92042e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "analyses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "filename" character varying(255), "originalName" character varying(255), "mimeType" character varying(100), "size" integer, "uploadTimestamp" TIMESTAMP NOT NULL DEFAULT now(), "documentType" character varying(100), "analysisDate" character varying(50), "rawResultText" text, "structuredReportData" jsonb, CONSTRAINT "PK_91421900ca225ed9865d016a940" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "blood_pressure_readings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "systolic" integer NOT NULL, "diastolic" integer NOT NULL, CONSTRAINT "PK_1a17b6f4e6d7e6bc20edd16d748" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100), "email" character varying(100) NOT NULL, "passwordHash" character varying NOT NULL, "dateOfBirth" date, "sex" character varying(10), "heightCm" integer, "weightKg" double precision, "isSmoker" boolean, "chronicConditions" text, "currentMedications" text, "profileComplete" boolean NOT NULL DEFAULT false, "usualSystolic" integer, "usualDiastolic" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "medication_reminders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reminder_time" TIME NOT NULL, "days_of_week" character varying array, "specific_date" date, "is_active" boolean NOT NULL DEFAULT true, "notes" text, "last_triggered_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "medication_id" uuid NOT NULL, CONSTRAINT "PK_d929c60ea7abab0a372feb7b86b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "medications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "dosage" character varying(50), "frequency" character varying(100), "start_date" date, "end_date" date, "notes" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, CONSTRAINT "PK_cdee49fe7cd79db13340150d356" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "indicators" ADD CONSTRAINT "FK_da0505967abcd8f7361498153e7" FOREIGN KEY ("analysisId") REFERENCES "analyses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "analyses" ADD CONSTRAINT "FK_13a6ee2b27236aaa71349b6dd03" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blood_pressure_readings" ADD CONSTRAINT "FK_b45b3da1db6ce634d4e4a7a4964" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medication_reminders" ADD CONSTRAINT "FK_c314c64ba33df833e7d85911689" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medication_reminders" ADD CONSTRAINT "FK_0645189ec8f57a1bd21f4657a8f" FOREIGN KEY ("medication_id") REFERENCES "medications"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medications" ADD CONSTRAINT "FK_3e8541ed0c975ed90ca265bb468" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "medications" DROP CONSTRAINT "FK_3e8541ed0c975ed90ca265bb468"`);
        await queryRunner.query(`ALTER TABLE "medication_reminders" DROP CONSTRAINT "FK_0645189ec8f57a1bd21f4657a8f"`);
        await queryRunner.query(`ALTER TABLE "medication_reminders" DROP CONSTRAINT "FK_c314c64ba33df833e7d85911689"`);
        await queryRunner.query(`ALTER TABLE "blood_pressure_readings" DROP CONSTRAINT "FK_b45b3da1db6ce634d4e4a7a4964"`);
        await queryRunner.query(`ALTER TABLE "analyses" DROP CONSTRAINT "FK_13a6ee2b27236aaa71349b6dd03"`);
        await queryRunner.query(`ALTER TABLE "indicators" DROP CONSTRAINT "FK_da0505967abcd8f7361498153e7"`);
        await queryRunner.query(`DROP TABLE "medications"`);
        await queryRunner.query(`DROP TABLE "medication_reminders"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "blood_pressure_readings"`);
        await queryRunner.query(`DROP TABLE "analyses"`);
        await queryRunner.query(`DROP TABLE "indicators"`);
    }

}
