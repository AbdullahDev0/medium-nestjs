import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GmailAccounts } from './entities/gmail-account.entity';
import { CreateGmailAccountDto } from './dtos/create-gmail-account.dto';
import { UpdateGmailAccountDto } from './dtos/update-gmail-account.dto';
import getOAuthClient from '../shared/utils/getOAuth2Client';
import customMessage from '../shared/responses/customMessage.response';
import {
  responseMessageInterface,
  tokenInterface,
  webhookQueryInterface,
} from '../shared/utils/interfaces';
import { Credentials } from 'google-auth-library/build/src/auth/credentials';
import { MESSAGE } from '../shared/utils/constants';
@Injectable()
export class GmailAccountService {
  constructor(
    @InjectRepository(GmailAccounts)
    private gmailAccountRepository: Repository<GmailAccounts>,
  ) {}

  /**
   * Creates a new Gmail account record.
   * @param dto - Data Transfer Object containing the Gmail account information.
   * @returns A promise that resolves to a response message interface.
   */
  async create(dto: CreateGmailAccountDto): Promise<responseMessageInterface> {
    try {
      const gmailAccount = this.gmailAccountRepository.create(dto);
      await this.gmailAccountRepository.save(gmailAccount);
      // Added OAuth2 call for getting user email access
      const oAuth2Client = getOAuthClient();
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://mail.google.com/'],
        state: dto.email,
      });
      return customMessage(HttpStatus.OK, MESSAGE.SUCCESS, {
        authUrl: authUrl,
      });
    } catch {
      return customMessage(HttpStatus.BAD_REQUEST, MESSAGE.BAD_REQUEST);
    }
  }

  /**
   * Updates an existing Gmail account record.
   * @param id - The identifier of the Gmail account to update.
   * @param dto - Data Transfer Object containing the updated Gmail account information.
   * @returns A promise that resolves to a response message interface.
   */
  async update(
    id: string,
    dto: UpdateGmailAccountDto,
  ): Promise<responseMessageInterface> {
    try {
      await this.gmailAccountRepository.update(id, dto);
      return customMessage(
        HttpStatus.OK,
        MESSAGE.SUCCESS,
        await this.gmailAccountRepository.findOne({ where: { id: id } }),
      );
    } catch {
      customMessage(HttpStatus.BAD_REQUEST, MESSAGE.BAD_REQUEST);
    }
  }

  /**
   * Handles the webhook callback to update Gmail account tokens.
   * @param query - Object containing the OAuth2 query parameters.
   * @returns A promise that resolves to a response message interface.
   */
  async getWebhook(
    query: webhookQueryInterface,
  ): Promise<responseMessageInterface> {
    const oAuth2Client = getOAuthClient();
    const { tokens } = await oAuth2Client.getToken(query.code);

    const gmailAccount = await this.gmailAccountRepository.findOne({
      where: { email: query.state },
    });

    const updates = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
      expiry_date: tokens.expiry_date,
      token_type: tokens.token_type,
    };

    await this.gmailAccountRepository.save({
      ...gmailAccount, // spread the existing account
      ...updates, // spread the new updates
    });

    return customMessage(HttpStatus.OK, 'Gmail account updated successfully.');
  }

  /**
   * Checks if a token is expired.
   * @param tokenExpiryDate - The expiry date of the token.
   * @returns A boolean indicating whether the token is expired.
   */
  public isTokenExpired(tokenExpiryDate: number): boolean {
    return tokenExpiryDate <= Date.now();
  }

  /**
   * Refreshes an OAuth2 token.
   * @param token - The current OAuth2 token.
   * @returns A promise that resolves to refreshed credentials.
   */
  public async refreshToken(token: tokenInterface): Promise<Credentials> {
    const oAuth2Client = getOAuthClient(token);
    const refreshedTokenResponse = await oAuth2Client.refreshAccessToken();
    return refreshedTokenResponse.credentials;
  }

  /**
   * Updates the token information in the database.
   * @param id - The identifier of the Gmail account.
   * @param updatedToken - The updated token information.
   * @returns A promise that resolves when the update is complete.
   */
  public async updateTokenInDB(id: string, updatedToken: any): Promise<void> {
    const user = await this.gmailAccountRepository.findOne({ where: { id } });
    if (user) {
      await this.gmailAccountRepository.update(user.email, updatedToken);
    }
  }

  /**
   * Validates a token and refreshes it if necessary.
   * @param id - The identifier of the Gmail account.
   * @returns A promise that resolves to the valid token information.
   */
  public async validToken(id: string): Promise<any> {
    const token = await this.getToken(id);
    if (!token) {
      return null;
    }

    if (this.isTokenExpired(token.expiry_date)) {
      const credentials = await this.refreshToken(token);

      const updatedToken = {
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token || token.refresh_token,
        expiry_date: credentials.expiry_date || token.expiry_date,
        token_type: credentials.token_type || token.token_type,
      };

      await this.updateTokenInDB(id, updatedToken);
      return updatedToken;
    }

    return token;
  }

  /**
   * Retrieves the token information from the database.
   * @param id - The identifier of the Gmail account.
   * @returns A promise that resolves to the token information or null if not found.
   */
  public async getToken(id: string): Promise<tokenInterface | null> {
    const user = await this.gmailAccountRepository.findOne({
      where: { id: id },
    });

    if (user) {
      return {
        access_token: user.access_token,
        refresh_token: user.refresh_token,
        scope: user.scope,
        expiry_date: user.expiry_date,
        token_type: user.token_type,
      };
    }

    return null;
  }
}
