import * as fs from 'fs';
import { CREDENTIALS_PATH, GMAIL_CREDS } from '../utils/constants';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library/build/src';
import { TokenInterface } from './interfaces';

/**
 * Creates and returns an OAuth2 client using Google's API.
 *
 * This function reads the Google API credentials from a file and initializes
 * an OAuth2 client. Optionally, it can also set the client's credentials
 * if an access token is provided.
 *
 * @param {object | null} token - The token object containing access and refresh tokens.
 *                                If provided, the OAuth2 client will be initialized with these credentials.
 *                                Default value is null.
 *
 * @returns An instance of google.auth.OAuth2, configured with client credentials and,
 *          optionally, with a provided token.
 */
export default function getOAuthClient(
  token: TokenInterface | null = null,
): OAuth2Client {
  const content = fs.readFileSync(CREDENTIALS_PATH + GMAIL_CREDS, 'utf-8');
  const credentials = JSON.parse(content);
  const { client_secret, client_id, redirect_uris } = credentials.web;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0],
  );
  if (token) {
    oAuth2Client.setCredentials(token);
  }

  return oAuth2Client;
}
