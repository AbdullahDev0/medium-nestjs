/**
 * Entity class representing a Gmail account.
 *
 * This class maps to the 'gmail_accounts' table in the database and defines the
 * schema for storing Gmail account details. It includes both user details and
 * OAuth2 token information necessary for accessing the Gmail API.
 *
 * @class GmailAccounts
 *
 * @property {string} id - Unique identifier for the Gmail account (UUID).
 * @property {string} full_name - The full name of the Gmail account user.
 * @property {string} email - The email address associated with the Gmail account.
 * @property {string} [access_token] - OAuth2 access token for the Gmail account (nullable).
 * @property {string} [refresh_token] - OAuth2 refresh token for the Gmail account (nullable).
 * @property {string} [token_type] - Type of the token, typically 'Bearer' (nullable).
 * @property {string} [scope] - Scope of access granted by the token (nullable).
 * @property {number} [expiry_date] - Timestamp indicating when the access token expires (nullable).
 */
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('gmail_accounts')
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
