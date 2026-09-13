import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSocialLoginAndOtpChannel1789037942712 implements MigrationInterface {
    name = 'AddSocialLoginAndOtpChannel1789037942712'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_1c18d2b83207e8b0f0848120e5"`);
        await queryRunner.query(`ALTER TABLE "otp_codes" DROP COLUMN "phoneNumber"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "googleId" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "appleId" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "termsAcceptedAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "otp_codes" ADD "target" character varying(255) NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."otp_codes_channel_enum" AS ENUM('sms', 'email')`);
        await queryRunner.query(`ALTER TABLE "otp_codes" ADD "channel" "public"."otp_codes_channel_enum" NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9a15bf89eaa0d2a6a4d769e490" ON "users"  ("appleId") WHERE "appleId" IS NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_4c36e26db7a5813eb9ed43881b" ON "users"  ("googleId") WHERE "googleId" IS NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_f4e3ffd5318f32f8382c514a2e" ON "otp_codes"  ("target", "channel", "purpose") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_f4e3ffd5318f32f8382c514a2e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4c36e26db7a5813eb9ed43881b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9a15bf89eaa0d2a6a4d769e490"`);
        await queryRunner.query(`ALTER TABLE "otp_codes" DROP COLUMN "channel"`);
        await queryRunner.query(`DROP TYPE "public"."otp_codes_channel_enum"`);
        await queryRunner.query(`ALTER TABLE "otp_codes" DROP COLUMN "target"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "termsAcceptedAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "appleId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "googleId"`);
        await queryRunner.query(`ALTER TABLE "otp_codes" ADD "phoneNumber" character varying(20) NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_1c18d2b83207e8b0f0848120e5" ON "otp_codes" USING btree ("phoneNumber", "purpose") `);
    }

}
