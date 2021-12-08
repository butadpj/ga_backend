import {MigrationInterface, QueryRunner} from "typeorm";

export class AllowNullToAditionalColumnInUsersTable1638953235407 implements MigrationInterface {
    name = 'AllowNullToAditionalColumnInUsersTable1638953235407'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "additional" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "additional" SET NOT NULL`);
    }

}
