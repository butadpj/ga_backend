import {MigrationInterface, QueryRunner} from "typeorm";

export class MakeTwitchStreamIdNullableInUserTwitchVideoTable1639567182979 implements MigrationInterface {
    name = 'MakeTwitchStreamIdNullableInUserTwitchVideoTable1639567182979'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_twitch_video" ALTER COLUMN "twitch_stream_id" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_twitch_video" ALTER COLUMN "twitch_stream_id" SET NOT NULL`);
    }

}
