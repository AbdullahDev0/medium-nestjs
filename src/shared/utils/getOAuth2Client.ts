import * as fs from 'fs';
import { CREDENTIALS_PATH, GMAIL_CREDS } from '../utils/constants';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library/build/src';

export default function getOAuthClient(
  token: object | null = null,
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
