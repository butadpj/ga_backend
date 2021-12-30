import {MigrationInterface, QueryRunner} from "typeorm";

export class AddIsEmailConfirmedColumnToUsersTable1640894879026 implements MigrationInterface {
    name = 'AddIsEmailConfirmedColumnToUsersTable1640894879026'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "isEmailConfirmed" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isEmailConfirmed"`);
    }

}
