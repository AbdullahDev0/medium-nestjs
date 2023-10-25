// update-gmail-account.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateGmailAccountDTO } from './create-gmail-account.dto';

export class UpdateGmailAccountDTO extends PartialType(CreateGmailAccountDTO) {}
