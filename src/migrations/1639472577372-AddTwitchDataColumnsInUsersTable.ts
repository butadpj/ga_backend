import {MigrationInterface, QueryRunner} from "typeorm";

export class AddTwitchDataColumnsInUsersTable1639472577372 implements MigrationInterface {
    name = 'AddTwitchDataColumnsInUsersTable1639472577372'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "twitch_user_id" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "twitch_display_name" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "twitch_email" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "twitch_display_picture" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twitch_display_picture"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twitch_email"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twitch_display_name"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twitch_user_id"`);
    }

}
