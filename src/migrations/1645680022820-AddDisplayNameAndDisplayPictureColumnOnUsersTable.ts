import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDisplayNameAndDisplayPictureColumnOnUsersTable1645680022820 implements MigrationInterface {
    name = 'AddDisplayNameAndDisplayPictureColumnOnUsersTable1645680022820'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "displayName" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "displayPicture" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "displayPicture"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "displayName"`);
    }

}
