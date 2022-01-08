import {MigrationInterface, QueryRunner} from "typeorm";

export class AddTwitchChannelQualifiedColumnToUsersTable1641568771603 implements MigrationInterface {
    name = 'AddTwitchChannelQualifiedColumnToUsersTable1641568771603'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "twitch_subscribers_count" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD "twitch_channel_qualified" boolean`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twitch_channel_qualified"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twitch_subscribers_count"`);
    }

}
