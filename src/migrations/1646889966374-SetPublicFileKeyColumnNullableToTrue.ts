import {MigrationInterface, QueryRunner} from "typeorm";

export class SetPublicFileKeyColumnNullableToTrue1646889966374 implements MigrationInterface {
    name = 'SetPublicFileKeyColumnNullableToTrue1646889966374'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public_file" ALTER COLUMN "key" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public_file" ALTER COLUMN "key" SET NOT NULL`);
    }

}
