// gmail-account.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GmailAccounts } from './entities/gmail-account.entity';
import { CreateGmailAccountDTO } from './dtos/create-gmail-account.dto';
import { UpdateGmailAccountDTO } from './dtos/update-gmail-account.dto';
import getOAuthClient from '../shared/utils/getOAuth2Client';
@Injectable()
export class GmailAccountService {
  constructor(
    @InjectRepository(GmailAccounts)
    private gmailAccountRepository: Repository<GmailAccounts>,
  ) {}

  async create(dto: CreateGmailAccountDTO): Promise<string> {
    const gmailAccount = this.gmailAccountRepository.create(dto);
    await this.gmailAccountRepository.save(gmailAccount);
    // Added OAuth2 call for getting user email access
    const oAuth2Client = getOAuthClient();
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://mail.google.com/'],
      state: dto.email,
    });
    return authUrl;
  }

  async update(id: string, dto: UpdateGmailAccountDTO): Promise<GmailAccounts> {
    await this.gmailAccountRepository.update(id, dto);
    return await this.gmailAccountRepository.findOne({ where: { id: id } });
  }

  async getWebhook(query: { code: string; state: string }) {
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

    // Return some response or the updated gmailAccount
    return { message: 'Gmail account updated successfully.' };
  }

  // Function to check if the token is expired
  public isTokenExpired(tokenExpiryDate: number): boolean {
    return tokenExpiryDate <= Date.now();
  }

  // Function to refresh the token
  public async refreshToken(token: any): Promise<any> {
    const oAuth2Client = getOAuthClient(token);
    const refreshedTokenResponse = await oAuth2Client.refreshAccessToken();
    return refreshedTokenResponse.credentials;
  }

  // Function to update the token in the database
  public async updateTokenInDB(id: string, updatedToken: any): Promise<void> {
    const user = await this.gmailAccountRepository.findOne({ where: { id } });
    if (user) {
      await this.gmailAccountRepository.update(user.email, updatedToken);
    }
  }

  // Function to validate the token and get an updated one if needed
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

  // Get token from DB
  public async getToken(id: string): Promise<{
    access_token: string;
    refresh_token: string;
    scope: string;
    expiry_date: number;
    token_type: string;
  } | null> {
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
