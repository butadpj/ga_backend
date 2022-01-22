import {MigrationInterface, QueryRunner} from "typeorm";

export class SetEmailColumnNullableValueToTrueInUsersTable1642761534961 implements MigrationInterface {
    name = 'SetEmailColumnNullableValueToTrueInUsersTable1642761534961'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "email" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "email" DROP NOT NULL`);
    }

}
