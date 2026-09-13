import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCouponsAndDiscounts1789107399595 implements MigrationInterface {
    name = 'AddCouponsAndDiscounts1789107399595'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."coupons_type_enum" AS ENUM('percentage', 'fixed')`);
        await queryRunner.query(`CREATE TABLE "coupons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(50) NOT NULL, "type" "public"."coupons_type_enum" NOT NULL, "value" numeric(10,2) NOT NULL, "usageLimit" integer NOT NULL DEFAULT '1', "usedCount" integer NOT NULL DEFAULT '0', "minOrderAmount" numeric(10,2), "maxDiscountAmount" numeric(10,2), "enabled" boolean NOT NULL DEFAULT true, "expiresAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e025109230e82925843f2a14c48" UNIQUE ("code"), CONSTRAINT "PK_d7ea8864a0150183770f3e9a8cb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "discountReason" character varying(30)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "couponCode" character varying(50)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "couponCode"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "discountReason"`);
        await queryRunner.query(`DROP TABLE "coupons"`);
        await queryRunner.query(`DROP TYPE "public"."coupons_type_enum"`);
    }

}
