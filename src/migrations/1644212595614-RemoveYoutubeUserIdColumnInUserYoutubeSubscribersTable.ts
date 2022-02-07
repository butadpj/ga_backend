import {MigrationInterface, QueryRunner} from "typeorm";

export class RemoveYoutubeUserIdColumnInUserYoutubeSubscribersTable1644212595614 implements MigrationInterface {
    name = 'RemoveYoutubeUserIdColumnInUserYoutubeSubscribersTable1644212595614'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_youtube_subscribers" DROP COLUMN "youtube_user_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_youtube_subscribers" ADD "youtube_user_id" character varying NOT NULL`);
    }

}
