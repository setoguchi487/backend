import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertInitialUser1767686961278 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // パスワード 'password' のMD5ハッシュ: 5f4dcc3b5aa765d61d8327deb882cf99
        // パスワード 'admin' のMD5ハッシュ: 21232f297a57a5a743894a0e4a801fc3
        await queryRunner.query(`
            INSERT INTO "user" ("name", "hash", "email") 
            VALUES 
                ('admin', '21232f297a57a5a743894a0e4a801fc3', 'admin@example.com'),
                ('testuser', '5f4dcc3b5aa765d61d8327deb882cf99', 'test@example.com')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "user" WHERE "name" IN ('admin', 'testuser')
        `);
    }

}
