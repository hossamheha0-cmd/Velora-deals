import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotifications1789231210533 implements MigrationInterface {
    name = 'AddNotifications1789231210533'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notification_reads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "notificationId" uuid NOT NULL, "userId" uuid NOT NULL, "readAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_c49ec541db45925cfb4e5c8dfbd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_368e4a570651c6ea1475099779" ON "notification_reads"  ("notificationId", "userId") `);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('promotion', 'new_arrival', 'order_update', 'general')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "titleAr" character varying(200) NOT NULL, "titleEn" character varying(200) NOT NULL, "bodyAr" text NOT NULL, "bodyEn" text NOT NULL, "type" "public"."notifications_type_enum" NOT NULL DEFAULT 'general', "targetUserId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_368e4a570651c6ea1475099779"`);
        await queryRunner.query(`DROP TABLE "notification_reads"`);
    }

}
