import {MigrationInterface, QueryRunner} from "typeorm";

export class RemoveYoutubeEmailColumnInUserYoutubeSubscribersTable1644210326575 implements MigrationInterface {
    name = 'RemoveYoutubeEmailColumnInUserYoutubeSubscribersTable1644210326575'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_youtube_data" DROP COLUMN "youtube_email"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_youtube_data" ADD "youtube_email" character varying`);
    }

}
