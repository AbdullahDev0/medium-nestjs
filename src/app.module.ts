import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GmailAccountModule } from './gmail-account/gmail-account.module';

/**
 * Root module of the application.
 *
 * - `imports`: Array of modules to include in this module.
 *   - `GmailAccountModule`: Module managing Gmail account functionalities.
 *   - `TypeOrmModule.forRoot()`: Configures TypeORM with database connection settings.
 *     - `type`: Type of the database (e.g., 'postgres').
 *     - `host`, `port`, `username`, `password`, `database`: Database connection parameters.
 *     - `entities`: Path to the entity files for TypeORM.
 *     - `logging`: Enables logging for TypeORM operations.
 *     - `synchronize`: Flag to control automatic database schema synchronization (not recommended for production).
 *     - `migrationsTableName`: Name of the table to manage TypeORM migrations.
 *     - `migrationsRun`: Whether to automatically run migrations on startup.
 * - `controllers`: Controllers that are part of this module.
 * - `providers`: Services/providers included in this module.
 */
@Module({
  imports: [
    GmailAccountModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      logging: true,
      synchronize: false,
      migrationsTableName: 'typeorm_migrations',
      migrationsRun: false,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
