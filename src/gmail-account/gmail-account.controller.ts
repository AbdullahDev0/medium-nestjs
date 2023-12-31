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
 * @method markEmailAsRead - Endpoint to mark email as read by account id and thread id to trash.
 * @method markEmailAsUnread - Endpoint to mark email as un-read by account id and thread id to trash.
 * @method downloadAttachment - Endpoint to allow downloading attachment by account id and attachment properties.
 * @method sendMail - Endpoint to send email.
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
  Res,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { GmailAccountService } from './gmail-account.service';
import { CreateGmailAccountDto } from './dtos/create-gmail-account.dto';
import { UpdateGmailAccountDto } from './dtos/update-gmail-account.dto';
import { HttpExceptionFilter } from '../shared/filters/http-exception.filter';
import { Response } from 'express';
import { DownloadAttachmentDto } from './dtos/download-attachment.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SendEmailDto } from './dtos/send-email.dto';
import customMessage from '../shared/responses/customMessage.response';
import { MESSAGE } from '../shared/utils/constants';

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

  @Get('read/:account_id/:thread_id')
  async markEmailAsRead(
    @Param('account_id') account_id: string,
    @Param('thread_id') thread_id: string,
  ) {
    return await this.gmailAccountService.markEmailAsRead(
      account_id,
      thread_id,
    );
  }

  @Get('un-read/:account_id/:thread_id')
  async markEmailAsUnread(
    @Param('account_id') account_id: string,
    @Param('thread_id') thread_id: string,
  ) {
    return await this.gmailAccountService.markEmailAsUnread(
      account_id,
      thread_id,
    );
  }

  @Post('download-attachment/:account_id')
  async downloadAttachment(
    @Param('account_id') accountId: string,
    @Body() downloadAttachmentDto: DownloadAttachmentDto,
    @Res() response: Response,
  ) {
    return this.gmailAccountService.downloadAttachment(
      accountId,
      downloadAttachmentDto,
      response,
    );
  }

  @Post(':account_id')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 10 }]))
  async sendMail(
    @Param('account_id') account_id: string,
    @Body() sendEmailDto: SendEmailDto,
    @UploadedFiles() files: { files?: Express.Multer.File[] },
    @Res() response: Response,
  ) {
    // Check the accumulative size of the files
    const totalSize = (files.files || []).reduce(
      (sum, file) => sum + file.size,
      0,
    );
    if (totalSize > 25 * 1024 * 1024) {
      // 25 MB in bytes
      throw new BadRequestException(
        customMessage(
          HttpStatus.BAD_REQUEST,
          MESSAGE.FILE_SIZE_EXCEPTION_MESSAGE,
        ),
      );
    }

    // If the size is within limits, proceed with the service call
    const emailAttachments: Express.Multer.File[] = files?.files || [];
    // Manuallay handle success response
    response
      .status(HttpStatus.OK)
      .send(
        await this.gmailAccountService.sendEmail(
          account_id,
          sendEmailDto,
          emailAttachments,
        ),
      );
  }
}
