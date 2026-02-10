import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserProfileBirthday1769000000002 implements MigrationInterface {
    name = 'AddUserProfileBirthday1769000000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "birthday" date`);
        await queryRunner.query(`ALTER TABLE "user" ADD "profile" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "profile"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "birthday"`);
    }
}
