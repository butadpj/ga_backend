import {MigrationInterface, QueryRunner} from "typeorm";

export class AddUserTwitchVideosEntityAndCreateUserToTwitchVideosRelation1639562198822 implements MigrationInterface {
    name = 'AddUserTwitchVideosEntityAndCreateUserToTwitchVideosRelation1639562198822'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_twitch_video" ("id" SERIAL NOT NULL, "twitch_id" character varying NOT NULL, "twitch_stream_id" character varying NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "published_at" TIMESTAMP WITH TIME ZONE NOT NULL, "url" character varying NOT NULL, "thumbnail_url" character varying NOT NULL, "viewable" character varying NOT NULL, "view_count" integer NOT NULL, "type" character varying NOT NULL, "duration" character varying NOT NULL, "userId" integer, CONSTRAINT "PK_d84b7123487702d020c6d186b88" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_twitch_video" ADD CONSTRAINT "FK_0b82369f54c179fd8478e8d3c8c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_twitch_video" DROP CONSTRAINT "FK_0b82369f54c179fd8478e8d3c8c"`);
        await queryRunner.query(`DROP TABLE "user_twitch_video"`);
    }

}
