import {MigrationInterface, QueryRunner} from "typeorm";

export class AddTwitchStateColumnToUsersTable1639392675329 implements MigrationInterface {
    name = 'AddTwitchStateColumnToUsersTable1639392675329'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "twitch_state" uuid DEFAULT uuid_generate_v4()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twitch_state"`);
    }

}
