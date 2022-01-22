import {MigrationInterface, QueryRunner} from "typeorm";

export class MoveTwitchDataFromUserEntityToUserTwitchDataEntity1642761416827 implements MigrationInterface {
    name = 'MoveTwitchDataFromUserEntityToUserTwitchDataEntity1642761416827'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_twitch_subscribers" DROP CONSTRAINT "FK_809a5dd94d412668aeecc5134db"`);
        await queryRunner.query(`ALTER TABLE "user_twitch_video" DROP CONSTRAINT "FK_0b82369f54c179fd8478e8d3c8c"`);
        await queryRunner.query(`ALTER TABLE "user_twitch_subscribers" RENAME COLUMN "userId" TO "twitchUserId"`);
        await queryRunner.query(`ALTER TABLE "user_twitch_video" RENAME COLUMN "userId" TO "twitchUserId"`);
        await queryRunner.query(`CREATE TABLE "user_twitch_data" ("id" SERIAL NOT NULL, "twitch_user_id" character varying, "twitch_display_name" character varying, "twitch_email" character varying, "twitch_display_picture" character varying, "twitch_followers_count" integer, "twitch_subscribers_count" integer, "twitch_channel_qualified" boolean, CONSTRAINT "PK_ed7efecbfb2737908ae64f579bb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twitch_user_id"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twitch_display_name"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twitch_email"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twitch_display_picture"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twitch_followers_count"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twitch_subscribers_count"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twitch_channel_qualified"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "email" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_twitch_subscribers" ADD CONSTRAINT "FK_4b152cd64e8c0fc1a399e45bbf1" FOREIGN KEY ("twitchUserId") REFERENCES "user_twitch_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_twitch_video" ADD CONSTRAINT "FK_eb96deb0441d36fb60c712686c9" FOREIGN KEY ("twitchUserId") REFERENCES "user_twitch_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_twitch_video" DROP CONSTRAINT "FK_eb96deb0441d36fb60c712686c9"`);
        await queryRunner.query(`ALTER TABLE "user_twitch_subscribers" DROP CONSTRAINT "FK_4b152cd64e8c0fc1a399e45bbf1"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "email" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "twitch_channel_qualified" boolean`);
        await queryRunner.query(`ALTER TABLE "user" ADD "twitch_subscribers_count" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD "twitch_followers_count" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD "twitch_display_picture" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "twitch_email" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "twitch_display_name" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "twitch_user_id" character varying`);
        await queryRunner.query(`DROP TABLE "user_twitch_data"`);
        await queryRunner.query(`ALTER TABLE "user_twitch_video" RENAME COLUMN "twitchUserId" TO "userId"`);
        await queryRunner.query(`ALTER TABLE "user_twitch_subscribers" RENAME COLUMN "twitchUserId" TO "userId"`);
        await queryRunner.query(`ALTER TABLE "user_twitch_video" ADD CONSTRAINT "FK_0b82369f54c179fd8478e8d3c8c" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_twitch_subscribers" ADD CONSTRAINT "FK_809a5dd94d412668aeecc5134db" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
