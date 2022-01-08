import {MigrationInterface, QueryRunner} from "typeorm";

export class AddTwitchFollowersCountColumnInUsersTable1641464276741 implements MigrationInterface {
    name = 'AddTwitchFollowersCountColumnInUsersTable1641464276741'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "twitch_followers_count" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twitch_followers_count"`);
    }

}
