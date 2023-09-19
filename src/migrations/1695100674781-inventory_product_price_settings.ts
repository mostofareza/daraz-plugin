import { MigrationInterface, QueryRunner } from "typeorm";

export class InventoryProductPriceSettings1695100674781 implements MigrationInterface {
    name = 'InventoryProductPriceSettings1695100674781'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "inventory_product_price_settings" ("id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "store_slug" character varying(255) NOT NULL, "currency_code" character varying(4) NOT NULL, "conversion_rate" double precision, "profit_amount" double precision NOT NULL, "shipping_charge" double precision NOT NULL, "profit_operation" "public"."inventory_product_price_settings_profit_operation_enum" NOT NULL, CONSTRAINT "UQ_d3cedb793cbcebba4576bef739b" UNIQUE ("store_slug", "currency_code"), CONSTRAINT "PK_2921e093d1ef460a7484ad06f75" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "inventory_product_price_settings"`);
    }

}
