// gmail-account.module.ts
import { Module } from '@nestjs/common';
import { GmailAccountController } from './gmail-account.controller';
import { GmailAccountService } from './gmail-account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GmailAccounts } from './entities/gmail-account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GmailAccounts])],
  controllers: [GmailAccountController],
  providers: [GmailAccountService],
})
export class GmailAccountModule {}
