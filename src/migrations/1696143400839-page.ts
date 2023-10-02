import { MigrationInterface, QueryRunner } from "typeorm";

export class Page1696143400839 implements MigrationInterface {
    name = 'Page1696143400839'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."page_status_enum" AS ENUM('publish', 'draft')`);
        await queryRunner.query(`CREATE TABLE "page" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "content" text NOT NULL, "name" character varying(255) NOT NULL, "handle" character varying(255) NOT NULL, "status" "public"."page_status_enum" NOT NULL DEFAULT 'draft', CONSTRAINT "UQ_0eceed6ff608a8794d8ef211f61" UNIQUE ("handle"), CONSTRAINT "PK_742f4117e065c5b6ad21b37ba1f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "page"`);
        await queryRunner.query(`DROP TYPE "public"."page_status_enum"`);
    }

}
