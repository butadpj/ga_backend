import {MigrationInterface, QueryRunner} from "typeorm";

export class RemoveAdditionalColumnInUsersTable1638953298286 implements MigrationInterface {
    name = 'RemoveAdditionalColumnInUsersTable1638953298286'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "additional"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "additional" character varying`);
    }

}
