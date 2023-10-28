import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class GmailAccounts1698406058495 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'gmail_accounts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'full_name',
            type: 'varchar',
          },
          {
            name: 'email',
            type: 'varchar',
          },
          {
            name: 'access_token',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'refresh_token',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'token_type',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'scope',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'expiry_date',
            type: 'bigint',
            isNullable: true,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('gmail_accounts');
  }
}
