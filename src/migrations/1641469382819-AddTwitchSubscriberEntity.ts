import {MigrationInterface, QueryRunner} from "typeorm";

export class AddTwitchSubscriberEntity1641469382819 implements MigrationInterface {
    name = 'AddTwitchSubscriberEntity1641469382819'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_twitch_subscribers" ("id" SERIAL NOT NULL, "twitch_id" character varying NOT NULL, "subscriber_id" character varying NOT NULL, "subscriber_name" character varying NOT NULL, "subscriber_display_picture" character varying NOT NULL, "is_gift" boolean NOT NULL, "userId" integer, CONSTRAINT "PK_d20608a67224232fde4f8c485a2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_twitch_subscribers" ADD CONSTRAINT "FK_809a5dd94d412668aeecc5134db" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_twitch_subscribers" DROP CONSTRAINT "FK_809a5dd94d412668aeecc5134db"`);
        await queryRunner.query(`DROP TABLE "user_twitch_subscribers"`);
    }

}
