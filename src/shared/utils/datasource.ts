import { DataSource } from 'typeorm';
import { join } from 'path';

/**
 * Defines the configuration for the TypeORM data source.
 *
 * - `type`: Specifies the database type, here it's PostgreSQL.
 * - `host`: Database host address.
 * - `port`: Port number on which the database server is running.
 * - `username`: Username for database access.
 * - `password`: Password for database access.
 * - `database`: Name of the database to connect to.
 * - `logging`: Enables logging of TypeORM operations.
 * - `entities`: Specifies the location of entity files for TypeORM.
 * - `migrations`: Specifies the path for database migration files.
 * - `synchronize`: Controls automatic synchronization (creation/update) of database schema. Set to false for production.
 * - `migrationsTableName`: Name of the table to track migrations.
 * - `migrationsRun`: Controls if migrations should automatically be run on application start.
 */
export const connectionSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'admin',
  database: 'gmail-sync',
  logging: true,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [join(__dirname, '/../../', 'database/migrations/**/*{.ts,.js}')],
  synchronize: false,
  migrationsTableName: 'typeorm_migrations',
  migrationsRun: false,
});
