/**
 * Controller for Gmail Account operations.
 *
 * This controller handles HTTP requests related to Gmail accounts, such as
 * creating and updating Gmail account details, and handling webhook callbacks.
 * It uses the GmailAccountService for the business logic of each operation.
 * The controller applies the HttpExceptionFilter for consistent error handling
 * across all its routes and uses the ValidationPipe to ensure that incoming
 * request data is correctly structured and validated.
 *
 * @class GmailAccountController
 * @decorator Controller - Defines the base route for all endpoints in this controller.
 * @decorator UseFilters - Applies the HttpExceptionFilter for error handling.
 * @decorator UsePipes - Applies the ValidationPipe for data validation.
 *
 * @method create - Endpoint for creating a new Gmail account.
 * @method update - Endpoint for updating an existing Gmail account by its ID.
 * @method getWebhook - Endpoint to handle webhook callbacks with query parameters.
 * @method syncMail - Endpoint to sync Gmail account mails with local DB.
 * @method moveToTrash - Endpoint to move email by account id and thread id to trash.
 * @method restoreFromTrash - Endpoint to restore email by account id and thread id to trash.
 */

import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  ValidationPipe,
  UsePipes,
  Get,
  Query,
  UseFilters,
} from '@nestjs/common';
import { GmailAccountService } from './gmail-account.service';
import { CreateGmailAccountDto } from './dtos/create-gmail-account.dto';
import { UpdateGmailAccountDto } from './dtos/update-gmail-account.dto';
import { HttpExceptionFilter } from '../shared/filters/http-exception.filter';

@UseFilters(HttpExceptionFilter)
@UsePipes(ValidationPipe)
@Controller('gmail-accounts')
export class GmailAccountController {
  constructor(private readonly gmailAccountService: GmailAccountService) {}

  @Post()
  async create(@Body() dto: CreateGmailAccountDto) {
    return await this.gmailAccountService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateGmailAccountDto) {
    return await this.gmailAccountService.update(id, dto);
  }

  @Get('webhook')
  async getWebhook(@Query() query: { code: string; state: string }) {
    return await this.gmailAccountService.getWebhook(query);
  }

  @Get('sync/:account_id')
  async syncMail(@Param('account_id') account_id: string) {
    return await this.gmailAccountService.syncMail(account_id);
  }

  @Get('trash/:account_id/:thread_id')
  async moveToTrash(
    @Param('account_id') account_id: string,
    @Param('thread_id') thread_id: string,
  ) {
    return await this.gmailAccountService.moveToTrash(account_id, thread_id);
  }

  @Get('un-trash/:account_id/:thread_id')
  async restoreFromTrash(
    @Param('account_id') account_id: string,
    @Param('thread_id') thread_id: string,
  ) {
    return await this.gmailAccountService.restoreFromTrash(
      account_id,
      thread_id,
    );
  }
}
