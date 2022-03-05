import {MigrationInterface, QueryRunner} from "typeorm";

export class ReplaceDisplayPictureColumnWithRelationTOPublicFileTable1645948594341 implements MigrationInterface {
    name = 'ReplaceDisplayPictureColumnWithRelationTOPublicFileTable1645948594341'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "displayPicture" TO "profilePictureId"`);
        await queryRunner.query(`CREATE TABLE "public_file" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, "key" character varying NOT NULL, CONSTRAINT "PK_bf2f5ba5aa6e3453b04cb4e4720" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "profilePictureId"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "profilePictureId" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_f58f9c73bc58e409038e56a4055" UNIQUE ("profilePictureId")`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_f58f9c73bc58e409038e56a4055" FOREIGN KEY ("profilePictureId") REFERENCES "public_file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_f58f9c73bc58e409038e56a4055"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_f58f9c73bc58e409038e56a4055"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "profilePictureId"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "profilePictureId" character varying`);
        await queryRunner.query(`DROP TABLE "public_file"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "profilePictureId" TO "displayPicture"`);
    }

}
