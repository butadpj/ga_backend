import {MigrationInterface, QueryRunner} from "typeorm";

export class SetOnDeleteCascadeOnUserTwitchDataAndUserTwitchSubscribersRelation1642846380970 implements MigrationInterface {
    name = 'SetOnDeleteCascadeOnUserTwitchDataAndUserTwitchSubscribersRelation1642846380970'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_twitch_subscribers" DROP CONSTRAINT "FK_101279f1779063bb60301102f3d"`);
        await queryRunner.query(`ALTER TABLE "user_twitch_subscribers" ADD CONSTRAINT "FK_101279f1779063bb60301102f3d" FOREIGN KEY ("twitchDataId") REFERENCES "user_twitch_data"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_twitch_subscribers" DROP CONSTRAINT "FK_101279f1779063bb60301102f3d"`);
        await queryRunner.query(`ALTER TABLE "user_twitch_subscribers" ADD CONSTRAINT "FK_101279f1779063bb60301102f3d" FOREIGN KEY ("twitchDataId") REFERENCES "user_twitch_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
