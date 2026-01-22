import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueUserConstraints1769000000001 implements MigrationInterface {
    name = 'AddUniqueUserConstraints1769000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_user_name" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_user_email" UNIQUE ("email")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_user_email"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_user_name"`);
    }
}
