// gmail-account.controller.ts
import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { GmailAccountService } from './gmail-account.service';
import { CreateGmailAccountDTO } from './dtos/create-gmail-account.dto';
import { UpdateGmailAccountDTO } from './dtos/update-gmail-account.dto';

@UsePipes(ValidationPipe)
@Controller('gmail-accounts')
export class GmailAccountController {
  constructor(private readonly gmailAccountService: GmailAccountService) {}

  @Post()
  async create(@Body() dto: CreateGmailAccountDTO) {
    return await this.gmailAccountService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateGmailAccountDTO) {
    return await this.gmailAccountService.update(id, dto);
  }
}
