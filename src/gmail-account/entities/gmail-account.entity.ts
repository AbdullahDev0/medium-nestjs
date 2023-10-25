import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('gmail-accounts')
export class GmailAccounts {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  full_name: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  access_token?: string;

  @Column({ type: 'varchar', nullable: true })
  refresh_token?: string;

  @Column({ type: 'varchar', nullable: true })
  token_type?: string;

  @Column({ type: 'varchar', nullable: true })
  scope?: string;

  @Column({ type: 'bigint', nullable: true })
  expiry_date?: number;
}
