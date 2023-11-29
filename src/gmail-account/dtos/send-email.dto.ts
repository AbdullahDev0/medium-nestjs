/**
 * Data Transfer Object for sending a new email.
 *
 * This class defines the data structure and validation rules for sending a new
 * email. It uses decorators from the 'class-validator' library to enforce
 * validation constraints on the data received from client requests.
 *
 * @class SendEmailDto
 *
 * @property to - Email to which the mail should be sent.
 *                      Must be a valid email format.
 * @property cc - Email to which the mail should be sent as cc.
 *                      Must be a valid email format, but param is optional.
 * @property bcc - Email to which the mail should be sent as bcc.
 *                      Must be a valid email format, but param is optional.
 * @property subject - Subject of the email.
 *
 * @property body - Body of the email.
 *
 */
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SendEmailDto {
  @IsEmail()
  to: string;

  @IsOptional()
  @IsEmail()
  cc: string;

  @IsOptional()
  @IsEmail()
  bcc: string;

  @IsString()
  @IsOptional()
  subject: string;

  @IsString()
  @IsOptional()
  body: string;
}
