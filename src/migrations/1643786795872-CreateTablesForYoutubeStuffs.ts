import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateTablesForYoutubeStuffs1643786795872 implements MigrationInterface {
    name = 'CreateTablesForYoutubeStuffs1643786795872'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_youtube_subscribers" ("id" SERIAL NOT NULL, "youtube_user_id" character varying NOT NULL, "subscriber_id" character varying NOT NULL, "subscriber_name" character varying NOT NULL, "subscriber_display_picture" character varying NOT NULL, "youtubeDataId" integer, CONSTRAINT "PK_24aea7e82513e8841f9955c7f5b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_youtube_video" ("id" SERIAL NOT NULL, "youtube_user_id" character varying NOT NULL, "video_id" character varying, "title" character varying NOT NULL, "description" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "published_at" TIMESTAMP WITH TIME ZONE NOT NULL, "url" character varying NOT NULL, "thumbnail_url" character varying NOT NULL, "view_count" integer NOT NULL, "type" character varying NOT NULL, "duration" character varying NOT NULL, "youtubeDataId" integer, CONSTRAINT "PK_75826abfdd19db05ac5224326e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_youtube_data" ("id" SERIAL NOT NULL, "youtube_user_id" character varying, "youtube_display_name" character varying, "youtube_email" character varying, "youtube_display_picture" character varying, "youtube_subscribers_count" integer, "userId" integer, CONSTRAINT "REL_146a0b848dd33d3b533d7ec847" UNIQUE ("userId"), CONSTRAINT "PK_54c564629147f4da8748ca9ca4d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_youtube_subscribers" ADD CONSTRAINT "FK_516ce402ba505ebbad4478c6a42" FOREIGN KEY ("youtubeDataId") REFERENCES "user_youtube_data"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_youtube_video" ADD CONSTRAINT "FK_ee8d5036b1c6975fa27c2aa645f" FOREIGN KEY ("youtubeDataId") REFERENCES "user_youtube_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_youtube_data" ADD CONSTRAINT "FK_146a0b848dd33d3b533d7ec847e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_youtube_data" DROP CONSTRAINT "FK_146a0b848dd33d3b533d7ec847e"`);
        await queryRunner.query(`ALTER TABLE "user_youtube_video" DROP CONSTRAINT "FK_ee8d5036b1c6975fa27c2aa645f"`);
        await queryRunner.query(`ALTER TABLE "user_youtube_subscribers" DROP CONSTRAINT "FK_516ce402ba505ebbad4478c6a42"`);
        await queryRunner.query(`DROP TABLE "user_youtube_data"`);
        await queryRunner.query(`DROP TABLE "user_youtube_video"`);
        await queryRunner.query(`DROP TABLE "user_youtube_subscribers"`);
    }

}
