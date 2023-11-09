/**
 * Data Transfer Object for creating a Gmail account.
 *
 * This class defines the data structure and validation rules for creating a new
 * Gmail account. It uses decorators from the 'class-validator' library to enforce
 * validation constraints on the data received from client requests.
 *
 * @class CreateGmailAccountDto
 *
 * @property full_name - Full name of the Gmail account user.
 *                      Must be a non-empty string.
 * @property email - Email address associated with the Gmail account.
 *                   Must be a valid email format.
 */
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateGmailAccountDto {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsEmail()
  email: string;
}
