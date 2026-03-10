import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserIconUrl1769000000003 implements MigrationInterface {
    name = 'AddUserIconUrl1769000000003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "icon_url" varchar`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "icon_url"`);
    }
}
