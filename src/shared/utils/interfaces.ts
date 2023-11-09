/**
 * Interface defining the structure of a response message.
 *
 * @interface
 * @property {number} statusCode - The HTTP status code of the response.
 * @property {Array<string>} message - An array of messages or descriptions associated with the response.
 * @property {object} data - Any additional data to be included in the response. This can be any valid object.
 */
export interface responseMessageInterface {
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
export interface tokenInterface {
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
export interface webhookQueryInterface {
  code: string;
  state: string;
}
