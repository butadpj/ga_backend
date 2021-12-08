import {MigrationInterface, QueryRunner} from "typeorm";

export class AddColumnAdditionalToUsersTable1638953002075 implements MigrationInterface {
    name = 'AddColumnAdditionalToUsersTable1638953002075'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "additional" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "additional"`);
    }

}
