/**
 * Migration to create the 'gmail_accounts' table.
 *
 * This migration sets up the schema for the 'gmail_accounts' table in the database.
 * The table is designed to store information about Gmail accounts, including user details
 * and OAuth token data necessary for accessing the Gmail API.
 *
 * The `up` method is used to create the table with the specified columns and types,
 * while the `down` method is responsible for removing the table if the migration is rolled back.
 *
 * @class GmailAccounts1698406058495
 * @implements {MigrationInterface}
 *
 * @method up - Creates the 'gmail_accounts' table with necessary columns.
 * @method down - Drops the 'gmail_accounts' table.
 */
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class GmailAccounts1698406058495 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'gmail_accounts',
        columns: [
          // Primary key column, generated using UUID version 4
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          // Column to store the full name of the Gmail account user
          {
            name: 'full_name',
            type: 'varchar',
          },
          // Column for the email address associated with the Gmail account
          {
            name: 'email',
            type: 'varchar',
          },
          // OAuth2 access token (nullable)
          {
            name: 'access_token',
            type: 'varchar',
            isNullable: true,
          },
          // OAuth2 refresh token (nullable)
          {
            name: 'refresh_token',
            type: 'varchar',
            isNullable: true,
          },
          // Type of the token, typically 'Bearer' (nullable)
          {
            name: 'token_type',
            type: 'varchar',
            isNullable: true,
          },
          // Scope of access granted by the token (nullable)
          {
            name: 'scope',
            type: 'varchar',
            isNullable: true,
          },
          // Timestamp indicating when the access token expires (nullable)
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
