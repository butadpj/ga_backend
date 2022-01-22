import {MigrationInterface, QueryRunner} from "typeorm";

export class MoveJoinColumnFromUsersEntityToUserTwitchDataEntity1642832164642 implements MigrationInterface {
    name = 'MoveJoinColumnFromUsersEntityToUserTwitchDataEntity1642832164642'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_c28b5d88692fb805709e0aa2e69"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_c28b5d88692fb805709e0aa2e69"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twitchDataId"`);
        await queryRunner.query(`ALTER TABLE "user_twitch_data" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "user_twitch_data" ADD CONSTRAINT "UQ_5d65127576e8d6bd70800f89659" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "user_twitch_data" ADD CONSTRAINT "FK_5d65127576e8d6bd70800f89659" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_twitch_data" DROP CONSTRAINT "FK_5d65127576e8d6bd70800f89659"`);
        await queryRunner.query(`ALTER TABLE "user_twitch_data" DROP CONSTRAINT "UQ_5d65127576e8d6bd70800f89659"`);
        await queryRunner.query(`ALTER TABLE "user_twitch_data" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "twitchDataId" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_c28b5d88692fb805709e0aa2e69" UNIQUE ("twitchDataId")`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_c28b5d88692fb805709e0aa2e69" FOREIGN KEY ("twitchDataId") REFERENCES "user_twitch_data"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
