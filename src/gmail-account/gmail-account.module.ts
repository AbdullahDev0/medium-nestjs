/**
 * NestJS module for Gmail Account functionality.
 *
 * This module is responsible for grouping together all the elements related
 * to the Gmail Account feature, including its service, controller, and entity.
 * It imports and registers the TypeOrmModule to enable the use of TypeORM
 * for database interactions specifically related to the GmailAccounts entity.
 *
 * @module
 * @requires NestJS Module, TypeOrmModule
 * @class GmailAccountModule
 *
 * @method imports - Registers the TypeOrmModule for the GmailAccounts entity.
 * @method controllers - Declares the GmailAccountController to handle incoming requests.
 * @method providers - Registers the GmailAccountService to encapsulate the business logic.
 */

import { Module } from '@nestjs/common';
import { GmailAccountController } from './gmail-account.controller';
import { GmailAccountService } from './gmail-account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GmailAccounts } from './entities/gmail-account.entity';
import { GmailThreads } from './entities/gmail-thread.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GmailAccounts, GmailThreads])],
  controllers: [GmailAccountController],
  providers: [GmailAccountService],
})
export class GmailAccountModule {}
