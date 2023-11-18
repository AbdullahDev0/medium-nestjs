import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class GmailThreads1699896950683 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: 'gmail_threads',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'uuid',
        },
        {
          name: 'account_id',
          type: 'uuid',
          isNullable: false,
        },
        {
          name: 'subject',
          type: 'text',
          isNullable: true,
        },
        {
          name: 'from',
          type: 'text',
          isNullable: true,
        },
        {
          name: 'to',
          type: 'text',
          isNullable: true,
        },
        {
          name: 'cc',
          type: 'text',
          isNullable: true,
        },
        {
          name: 'bcc',
          type: 'text',
          isNullable: true,
        },
        {
          name: 'date',
          type: 'timestamp with time zone',
          isNullable: true,
        },
        {
          name: 'body',
          type: 'text',
          isNullable: true,
        },
        {
          name: 'attachments',
          type: 'jsonb',
          isNullable: true,
        },
        {
          name: 'label_ids',
          type: 'text[]',
          isNullable: true,
        },
        {
          name: 'thread_id',
          type: 'text',
          isNullable: false,
        },
      ],
    });

    await queryRunner.createTable(table, true);

    const foreignKey = new TableForeignKey({
      columnNames: ['account_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'gmail_accounts',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
    await queryRunner.createForeignKey('gmail_threads', foreignKey);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('gmail_threads');
  }
}
