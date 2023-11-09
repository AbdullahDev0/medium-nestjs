/**
 * Data Transfer Object for updating a Gmail account.
 *
 * This class extends `CreateGmailAccountDto` using `PartialType`, which makes
 * all the properties of `CreateGmailAccountDto` optional. This approach is useful
 * for update operations where only a subset of the properties may be provided for
 * modification, without the need to resend all existing data.
 *
 * @class UpdateGmailAccountDto
 *
 * Inherits from `CreateGmailAccountDto`. All properties from `CreateGmailAccountDto`
 * are available but optional, allowing partial updates to the Gmail account.
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateGmailAccountDto } from './create-gmail-account.dto';

export class UpdateGmailAccountDto extends PartialType(CreateGmailAccountDto) {}
