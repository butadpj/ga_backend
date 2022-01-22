import {MigrationInterface, QueryRunner} from "typeorm";

export class RenameRelationNameFromTwitchUserToTwitchData1642761829113 implements MigrationInterface {
    name = 'RenameRelationNameFromTwitchUserToTwitchData1642761829113'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_twitch_subscribers" DROP CONSTRAINT "FK_4b152cd64e8c0fc1a399e45bbf1"`);
        await queryRunner.query(`ALTER TABLE "user_twitch_video" DROP CONSTRAINT "FK_eb96deb0441d36fb60c712686c9"`);
        await queryRunner.query(`ALTER TABLE "user_twitch_subscribers" RENAME COLUMN "twitchUserId" TO "twitchDataId"`);
        await queryRunner.query(`ALTER TABLE "user_twitch_video" RENAME COLUMN "twitchUserId" TO "twitchDataId"`);
        await queryRunner.query(`ALTER TABLE "user_twitch_subscribers" ADD CONSTRAINT "FK_101279f1779063bb60301102f3d" FOREIGN KEY ("twitchDataId") REFERENCES "user_twitch_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_twitch_video" ADD CONSTRAINT "FK_ffe1f71381301f7d31fa12a9a23" FOREIGN KEY ("twitchDataId") REFERENCES "user_twitch_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_twitch_video" DROP CONSTRAINT "FK_ffe1f71381301f7d31fa12a9a23"`);
        await queryRunner.query(`ALTER TABLE "user_twitch_subscribers" DROP CONSTRAINT "FK_101279f1779063bb60301102f3d"`);
        await queryRunner.query(`ALTER TABLE "user_twitch_video" RENAME COLUMN "twitchDataId" TO "twitchUserId"`);
        await queryRunner.query(`ALTER TABLE "user_twitch_subscribers" RENAME COLUMN "twitchDataId" TO "twitchUserId"`);
        await queryRunner.query(`ALTER TABLE "user_twitch_video" ADD CONSTRAINT "FK_eb96deb0441d36fb60c712686c9" FOREIGN KEY ("twitchUserId") REFERENCES "user_twitch_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_twitch_subscribers" ADD CONSTRAINT "FK_4b152cd64e8c0fc1a399e45bbf1" FOREIGN KEY ("twitchUserId") REFERENCES "user_twitch_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
