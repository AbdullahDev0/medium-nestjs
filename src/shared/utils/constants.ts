// Path to the directory where credential files are stored.
export const CREDENTIALS_PATH = 'src/shared/utils/credentials/';

// File name for the Gmail credentials JSON file.
export const GMAIL_CREDS = 'gmail_creds.json';

/**
 * Enum for standardized message responses.
 *
 * MESSAGE.BAD_REQUEST - Used for indicating a bad or invalid request.
 * MESSAGE.SUCCESS - Used to indicate successful completion of an operation.
 * MESSAGE.UNAUTHORIZED - Used to indicate that user is not authorized for this operation.
 * MESSAGE.USER_NOT_FOUND - Used to indicate that user record not found in DB.
 * MESSAGE.FILE_SIZE_EXCEPTION_MESSAGE - Used to indicate that uploaded files size increase threshold limit.
 */
export enum MESSAGE {
  BAD_REQUEST = 'bad request',
  SUCCESS = 'success',
  UNAUTHORIZED = 'user is not authorized',
  USER_NOT_FOUND = 'user is not registerred',
  FILE_SIZE_EXCEPTION_MESSAGE = 'total file size exceeds the maximum limit of 25 MB',
}
