import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GmailAccounts } from './gmail-account.entity';

@Entity('gmail_threads')
export class GmailThreads {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  account_id: string;

  @ManyToOne(() => GmailAccounts)
  @JoinColumn({ name: 'account_id' })
  account: GmailAccounts;

  @Column({ type: 'text', nullable: true })
  subject: string;

  @Column({ type: 'text', nullable: true })
  from: string;

  @Column({ type: 'text', nullable: true })
  to: string;

  @Column({ type: 'text', nullable: true })
  cc: string;

  @Column({ type: 'text', nullable: true })
  bcc: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  date: Date;

  @Column({ type: 'text', nullable: true })
  body: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments: any;

  @Column({ type: 'text', array: true, nullable: true })
  label_ids: string[];

  @Column({ type: 'text' })
  thread_id: string;
}
