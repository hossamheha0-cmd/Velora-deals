import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBankAccounts1789153059611 implements MigrationInterface {
    name = 'AddBankAccounts1789153059611'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "bank_accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bankName" character varying(150) NOT NULL, "accountHolderName" character varying(150) NOT NULL, "accountNumberLast4" character varying(50) NOT NULL, "ibanLast4" character varying(50), "isActive" boolean NOT NULL DEFAULT false, "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c872de764f2038224a013ff25ed" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "bank_accounts"`);
    }

}
