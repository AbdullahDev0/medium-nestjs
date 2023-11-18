import { gmail_v1 } from 'googleapis';

/**
 * Interface defining the structure of a response message.
 *
 * @interface
 * @property {number} statusCode - The HTTP status code of the response.
 * @property {Array<string>} message - An array of messages or descriptions associated with the response.
 * @property {object} data - Any additional data to be included in the response. This can be any valid object.
 */
export interface ResponseMessageInterface {
  statusCode: number;
  message: Array<string>;
  data: object;
}

/**
 * Interface representing the structure of an OAuth2 token.
 *
 * @interface
 * @property {string} access_token - The OAuth2 access token.
 * @property {string} refresh_token - The OAuth2 refresh token, used to obtain new access tokens.
 * @property {string} scope - The scope of access granted by the access token.
 * @property {number} expiry_date - The timestamp (in milliseconds) at which the access token expires.
 * @property {string} token_type - The type of token (typically "Bearer").
 */
export interface TokenInterface {
  access_token: string;
  refresh_token: string;
  scope: string;
  expiry_date: number;
  token_type: string;
}

/**
 * Interface defining the query parameters for a webhook request.
 *
 * @interface
 * @property {string} code - The authorization code that is returned in the query string.
 * @property {string} state - A value used to maintain state between the request and the callback, typically the email of the user.
 */
export interface WebhookQueryInterface {
  code: string;
  state: string;
}

// TODO: update code
export interface ThreadInterface {
  account_id: string;
  subject: string | null;
  from: string | null;
  to: string | null;
  cc: string | null;
  bcc: string | null;
  date: Date | null;
  body: string | null;
  thread_id: string | null;
  attachments: {
    filename: string;
    url?: string | null;
  }[];
  label_ids: any;
}

export interface ExtendedGmailMessage extends gmail_v1.Schema$Message {
  labelIds: string[];
}

export interface ThreadListParams {
  userId: string;
  maxResults: number;
  pageToken: string;
  q?: string;
}

export interface MessageInterface {
  labelIds: string[];
  id: string;
  payload: {
    body: gmail_v1.Schema$MessagePartBody;
    parts: gmail_v1.Schema$MessagePart[];
    headers: gmail_v1.Schema$MessagePartHeader[];
  };
}

export interface AttachmentsResponseInterface {
  filename: string;
  url?: string;
}
