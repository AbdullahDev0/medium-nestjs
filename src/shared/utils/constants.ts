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
 */
export enum MESSAGE {
  BAD_REQUEST = 'bad request',
  SUCCESS = 'success',
  UNAUTHORIZED = 'user is not authorized',
}
