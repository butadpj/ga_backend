import {MigrationInterface, QueryRunner} from "typeorm";

export class DeleteTwitchStateColumnInUsersTable1639468704286 implements MigrationInterface {
    name = 'DeleteTwitchStateColumnInUsersTable1639468704286'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twitch_state"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "twitch_state" uuid DEFAULT uuid_generate_v4()`);
    }

}
