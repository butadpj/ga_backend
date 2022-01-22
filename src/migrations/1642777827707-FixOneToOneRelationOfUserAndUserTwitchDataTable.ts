import {MigrationInterface, QueryRunner} from "typeorm";

export class FixOneToOneRelationOfUserAndUserTwitchDataTable1642777827707 implements MigrationInterface {
    name = 'FixOneToOneRelationOfUserAndUserTwitchDataTable1642777827707'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "twitchDataId" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_c28b5d88692fb805709e0aa2e69" UNIQUE ("twitchDataId")`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_c28b5d88692fb805709e0aa2e69" FOREIGN KEY ("twitchDataId") REFERENCES "user_twitch_data"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_c28b5d88692fb805709e0aa2e69"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_c28b5d88692fb805709e0aa2e69"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twitchDataId"`);
    }

}
