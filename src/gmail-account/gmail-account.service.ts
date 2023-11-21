import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GmailAccounts } from './entities/gmail-account.entity';
import { CreateGmailAccountDto } from './dtos/create-gmail-account.dto';
import { UpdateGmailAccountDto } from './dtos/update-gmail-account.dto';
import getOAuthClient from '../shared/utils/getOAuth2Client';
import customMessage from '../shared/responses/customMessage.response';
import {
  AttachmentsResponseInterface,
  MessageInterface,
  ResponseMessageInterface,
  ThreadInterface,
  ThreadListParams,
  TokenInterface,
  WebhookQueryInterface,
} from '../shared/utils/interfaces';
import { Credentials } from 'google-auth-library/build/src/auth/credentials';
import { MESSAGE } from '../shared/utils/constants';
import { OAuth2Client } from 'google-auth-library';
import { gmail_v1, google } from 'googleapis';
import { GmailThreads } from './entities/gmail-thread.entity';

@Injectable()
export class GmailAccountService {
  constructor(
    @InjectRepository(GmailAccounts)
    private gmailAccountRepository: Repository<GmailAccounts>,
    @InjectRepository(GmailThreads)
    private gmailThreadRepository: Repository<GmailThreads>,
  ) {}

  /**
   * Creates a new Gmail account record.
   * @param dto - Data Transfer Object containing the Gmail account information.
   * @returns A promise that resolves to a response message interface.
   */
  async create(dto: CreateGmailAccountDto): Promise<ResponseMessageInterface> {
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
    } catch (error) {
      console.error('Error in create:', error);
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
  ): Promise<ResponseMessageInterface> {
    try {
      await this.gmailAccountRepository.update(id, dto);
      return customMessage(
        HttpStatus.OK,
        MESSAGE.SUCCESS,
        await this.gmailAccountRepository.findOne({ where: { id: id } }),
      );
    } catch (error) {
      console.error('Error in update:', error);
      customMessage(HttpStatus.BAD_REQUEST, MESSAGE.BAD_REQUEST);
    }
  }

  /**
   * Handles the webhook callback to update Gmail account tokens.
   * @param query - Object containing the OAuth2 query parameters.
   * @returns A promise that resolves to a response message interface.
   */
  async getWebhook(
    query: WebhookQueryInterface,
  ): Promise<ResponseMessageInterface> {
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
  isTokenExpired(tokenExpiryDate: number): boolean {
    return tokenExpiryDate <= Date.now();
  }

  /**
   * Refreshes an OAuth2 token.
   * @param token - The current OAuth2 token.
   * @returns A promise that resolves to refreshed credentials.
   */
  async refreshToken(token: TokenInterface): Promise<Credentials> {
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
  async updateTokenInDB(
    id: string,
    updatedToken: TokenInterface,
  ): Promise<void> {
    const user = await this.gmailAccountRepository.findOne({ where: { id } });
    if (user) {
      await this.gmailAccountRepository.update(user.id, updatedToken);
    }
  }

  /**
   * Validates a token and refreshes it if necessary.
   * @param id - The identifier of the Gmail account.
   * @returns A promise that resolves to the valid token information.
   */
  async validToken(id: string): Promise<TokenInterface> {
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
        scope: credentials.scope || token.scope,
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
  async getToken(id: string): Promise<TokenInterface | null> {
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

  /**
   * Synchronizes email threads from a Gmail account. It checks for the latest or oldest threads based on the page number.
   * If it's the first page, it synchronizes the latest threads; otherwise, it synchronizes older threads.
   * @param {string} id - The identifier for the Gmail account.
   * @param {number} [page=1] - The current page number for pagination.
   * @param {number} [pageSize=50] - The number of threads to be fetched per page.
   * @returns {Promise<GmailThreads[]>} - A promise that resolves to an array of Gmail thread objects.
   */
  async syncMail(
    id: string,
    page = 1,
    pageSize = 50,
  ): Promise<ResponseMessageInterface> {
    try {
      const oAuth2Client = await this.prepareOAuthClient(id);
      if (!oAuth2Client) throw new Error('OAuth2 client preparation failed');

      const data =
        page === 1
          ? await this.syncLatestThreads(id, oAuth2Client, pageSize)
          : await this.syncOlderThreads(id, oAuth2Client, page, pageSize);
      return customMessage(
        HttpStatus.OK,
        'Gmail account updated successfully.',
        data,
      );
    } catch (error) {
      console.error('Error in syncMail:', error);
      return customMessage(HttpStatus.BAD_REQUEST, MESSAGE.BAD_REQUEST);
    }
  }

  /**
   * Prepares an OAuth2 client for accessing Gmail API by validating the user's token.
   * @param {string} id - The identifier for the Gmail account.
   * @returns {Promise<OAuth2Client | null>} - A promise that resolves to an OAuth2Client if the token is valid, or null otherwise.
   */
  async prepareOAuthClient(id: string): Promise<OAuth2Client | null> {
    try {
      const token = await this.validToken(id);
      return token ? getOAuthClient(token) : null;
    } catch (error) {
      console.error('Error in prepareOAuthClient:', error);
      return null;
    }
  }

  /**
   * Synchronizes the latest email threads from a Gmail account based on the most recent thread's date.
   * @param {string} id - The identifier for the Gmail account.
   * @param {OAuth2Client} oAuth2Client - The OAuth2 client for making authenticated requests.
   * @param {number} pageSize - The number of threads to be fetched.
   * @returns {Promise<GmailThreads[]>} - A promise that resolves to an array of the latest Gmail thread objects.
   */
  async syncLatestThreads(
    id: string,
    oAuth2Client: OAuth2Client,
    pageSize: number,
  ): Promise<GmailThreads[]> {
    try {
      const latestThread = await this.getLatestThread();
      const lastThreadDate = latestThread?.date
        ? new Date(latestThread.date).getTime() / 1000
        : undefined;

      return this.syncThreadsCommon(
        id,
        oAuth2Client,
        lastThreadDate,
        true,
        1,
        pageSize,
      );
    } catch (error) {
      console.error('Error in syncLatestThreads:', error);
      return [];
    }
  }

  /**
   * Synchronizes older email threads from a Gmail account based on the oldest thread's date.
   * This function is called for pages other than the first one in the pagination.
   * @param {string} id - The identifier for the Gmail account.
   * @param {OAuth2Client} oAuth2Client - The OAuth2 client for making authenticated requests.
   * @param {number} page - The current page number for pagination.
   * @param {number} pageSize - The number of threads to be fetched per page.
   * @returns {Promise<GmailThreads[]>} - A pr0omise that resolves to an array of older Gmail thread objects, or to all threads if the oldest thread date is not available.
   */
  async syncOlderThreads(
    id: string,
    oAuth2Client: OAuth2Client,
    page: number,
    pageSize: number,
  ): Promise<GmailThreads[]> {
    try {
      const oldestThread = await this.getOldestThread();
      const oldestThreadDate = oldestThread?.date
        ? new Date(oldestThread.date).getTime() / 1000
        : undefined;

      if (oldestThreadDate) {
        return this.syncThreadsCommon(
          id,
          oAuth2Client,
          oldestThreadDate,
          false,
          page,
          pageSize,
        );
      }

      return this.getThreadsByAccountAndPage(id, page, pageSize);
    } catch (error) {
      console.error('Error in syncOlderThreads:', error);
      return [];
    }
  }

  /**
   * Common function for synchronizing threads. It fetches thread IDs based on the reference date and whether it's the latest or older threads.
   * After fetching the threads, it processes and creates them in bulk and then retrieves them by account and page.
   * @param {string} id - The identifier for the Gmail account.
   * @param {OAuth2Client} oAuth2Client - The OAuth2 client for making authenticated requests.
   * @param {number | undefined} referenceDate - The reference date for fetching threads.
   * @param {boolean} isLatest - Flag to determine if the latest threads are being fetched.
   * @param {number} page - The current page number for pagination.
   * @param {number} pageSize - The number of threads per page.
   * @returns {Promise<GmailThreads[]>} - A promise that resolves to the threads of the specified account and page.
   */
  async syncThreadsCommon(
    id: string,
    oAuth2Client: OAuth2Client,
    referenceDate: number | undefined,
    isLatest: boolean,
    page: number,
    pageSize: number,
  ): Promise<GmailThreads[]> {
    try {
      const threadIds =
        (
          await this.listThreadIds(
            oAuth2Client,
            undefined,
            referenceDate,
            isLatest,
          )
        ).threads || [];

      const threadDetails = await this.fetchThreadDetails(
        threadIds,
        oAuth2Client,
        id,
        referenceDate,
        isLatest,
      );

      await this.createBulk(threadDetails);
      return this.getThreadsByAccountAndPage(id, page, pageSize);
    } catch (error) {
      console.error('Error in syncThreadsCommon:', error);
      return [];
    }
  }

  /**
   * Lists the thread IDs from a Gmail account. It can filter threads based on a date and whether to fetch the latest or older threads.
   * @param {OAuth2Client} oAuth2Client - The OAuth2 client for making authenticated requests.
   * @param {string | undefined} pageToken - The token for pagination.
   * @param {number | undefined} sinceDateTimestamp - The timestamp used for filtering threads.
   * @param {boolean | undefined} isLatest - Flag to determine if the latest threads are being fetched.
   * @returns {Promise<gmail_v1.Schema$ListThreadsResponse>} - A promise that resolves to a list of thread IDs.
   */
  async listThreadIds(
    oAuth2Client: OAuth2Client,
    pageToken?: string,
    sinceDateTimestamp?: number,
    isLatest?: boolean,
  ): Promise<gmail_v1.Schema$ListThreadsResponse> {
    try {
      const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

      const params: ThreadListParams = {
        userId: 'me',
        maxResults: 50,
        pageToken: pageToken,
      };

      if (sinceDateTimestamp) {
        if (isLatest) {
          params.q = `after:${sinceDateTimestamp}`;
        } else {
          params.q = `before:${sinceDateTimestamp}`;
        }
      }

      const response = await gmail.users.threads.list(params);
      return response.data;
    } catch (error) {
      console.error('Error in listThreadIds:', error);
      return { threads: [] };
    }
  }

  /**
   * Fetches the details of specified threads. It includes filtering messages based on a timestamp and processing each message.
   * @param {gmail_v1.Schema$Thread[]} threads - An array of thread identifiers.
   * @param {OAuth2Client} oAuth2Client - The OAuth2 client for making authenticated requests.
   * @param {string} id - The identifier for the Gmail account.
   * @param {number | undefined} sinceDateTimestamp - The timestamp used for filtering messages.
   * @param {boolean} isLatest - Flag to determine if the latest messages are being fetched.
   * @returns {Promise<GmailThreads[]>} - A promise that resolves to an array of thread details.
   */
  async fetchThreadDetails(
    threads: gmail_v1.Schema$Thread[],
    oAuth2Client: OAuth2Client,
    id: string,
    sinceDateTimestamp: number | undefined,
    isLatest: boolean,
  ): Promise<GmailThreads[]> {
    try {
      const threadDetails = [];
      for (const thread of threads) {
        const threadData = await this.getThreadDetails(thread.id, oAuth2Client);
        const relevantMessages = this.filterMessages(
          threadData.messages,
          sinceDateTimestamp,
          isLatest,
        );
        const messages: ThreadInterface[] = await this.processMessages(
          relevantMessages,
          oAuth2Client,
          id,
          thread.id,
        );
        threadDetails.push(...messages);
      }
      return threadDetails;
    } catch (error) {
      console.error('Error in fetchThreadDetails:', error);
      return [];
    }
  }

  /**
   * Filters messages based on a given timestamp and whether to fetch latest or older messages.
   * @param {gmail_v1.Schema$Message[]} messages - An array of message objects to be filtered.
   * @param {number | undefined} sinceDateTimestamp - The timestamp used for filtering messages.
   * @param {boolean} isLatest - Flag to determine if the latest messages are being fetched.
   * @returns {gmail_v1.Schema$Message[]} - An array of filtered message objects.
   */
  filterMessages(
    messages: gmail_v1.Schema$Message[],
    sinceDateTimestamp: number | undefined,
    isLatest: boolean,
  ): gmail_v1.Schema$Message[] {
    if (!sinceDateTimestamp) {
      return messages;
    }
    return messages.filter((message: gmail_v1.Schema$Message) => {
      const messageTimestamp = parseInt(message.internalDate, 10) / 1000;
      return isLatest
        ? messageTimestamp > sinceDateTimestamp
        : messageTimestamp < sinceDateTimestamp;
    });
  }

  /**
   * Processes an array of messages by extracting detailed information from each message.
   * @param {gmail_v1.Schema$Message[]} messages - An array of message objects to be processed.
   * @param {OAuth2Client} oAuth2Client - The OAuth2 client for making authenticated requests.
   * @param {string} id - The identifier for the Gmail account.
   * @param {string} threadId - The identifier for the thread to which the messages belong.
   * @returns {Promise<threadInterface[]>} - A promise that resolves to an array of processed message details.
   */
  async processMessages(
    messages: gmail_v1.Schema$Message[],
    oAuth2Client: OAuth2Client,
    id: string,
    threadId: string,
  ): Promise<ThreadInterface[]> {
    return Promise.all(
      messages.map(async (message: { id: string }) => {
        return this.extractMailInfo(
          await this.getEmailDetails(message.id, oAuth2Client),
          id,
          threadId,
        );
      }),
    );
  }

  /**
   * Retrieves the most recent email thread from the Gmail thread repository.
   * @returns {Promise<GmailThreads | null>} - A promise that resolves to the latest Gmail thread, or null if none found.
   */
  async getLatestThread(): Promise<GmailThreads | null> {
    try {
      return await this.gmailThreadRepository.findOne({
        where: {},
        order: {
          date: 'DESC',
        },
      });
    } catch (error) {
      console.error('Error in getLatestThread:', error);
      return null;
    }
  }

  /**
   * Retrieves the oldest email thread from the Gmail thread repository.
   * @returns {Promise<GmailThreads | null>} - A promise that resolves to the oldest Gmail thread, or null if none found.
   */
  async getOldestThread(): Promise<GmailThreads | null> {
    try {
      return await this.gmailThreadRepository.findOne({
        order: {
          date: 'ASC',
        },
      });
    } catch (error) {
      console.error('Error in getOldestThread:', error);
      return null;
    }
  }

  /**
   * Fetches detailed information for a specific email thread using the Gmail API.
   * @param {string} threadId - The identifier of the email thread.
   * @param {OAuth2Client} oAuth2Client - The OAuth2 client for making authenticated requests to the Gmail API.
   * @returns {Promise<gmail_v1.Schema$Thread>} - A promise that resolves to the details of the specified email thread.
   */
  async getThreadDetails(
    threadId: string,
    oAuth2Client: OAuth2Client,
  ): Promise<gmail_v1.Schema$Thread> {
    try {
      const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
      const params = {
        userId: 'me',
        id: threadId,
      };
      const response = await gmail.users.threads.get(params);
      return response.data;
    } catch (error) {
      console.error('Error in getThreadDetails:', error);
      return null;
    }
  }

  /**
   * Saves a collection of Gmail thread details to the repository in bulk.
   * @param {GmailThreads[]} threadDetails - An array of Gmail thread objects to be saved.
   * @returns {Promise<void>} - A promise that resolves when the thread details have been successfully saved.
   */
  async createBulk(threadDetails: GmailThreads[]): Promise<void> {
    try {
      await this.gmailThreadRepository.save(threadDetails);
    } catch (error) {
      console.error('Error in createBulk:', error);
      throw error;
    }
  }

  /**
   * Extracts detailed information from an email message, including attachments, headers, and constructs a mail information object.
   * Optionally includes the thread ID if provided.
   * @param {Object} message - The message object containing the email data, including label IDs, message ID, and payload.
   * @param {string} id - The identifier for the Gmail account.
   * @param {string} [threadId] - Optional. The identifier for the thread to which the message belongs.
   * @returns {Object} - The detailed information of the email, including subject, from, to, cc, bcc, date, body, attachments, label IDs, and thread ID.
   */
  extractMailInfo(
    message: MessageInterface,
    id: string,
    threadId?: string,
  ): ThreadInterface {
    try {
      const attachments = this.extractAttachments(message);
      const headers = this.extractHeaders(message);

      const mailInfo = this.constructMailInfoObject(
        id,
        message,
        headers,
        attachments,
      );

      if (threadId) {
        mailInfo['thread_id'] = threadId;
      }

      return mailInfo;
    } catch (error) {
      console.error('Error in extractMailInfo:', error);
      return null;
    }
  }

  /**
   * Extracts attachment details from an email message.
   * @param {Object} message - The message object containing the email data.
   * @returns {AttachmentsResponseInterface} - An array of objects each containing details of an attachment, including filename and URL.
   */
  private extractAttachments(
    message: MessageInterface,
  ): AttachmentsResponseInterface[] {
    const attachments: {
      filename: string;
      url?: string;
    }[] = [];

    if (message.payload.parts) {
      message.payload.parts.forEach((part: gmail_v1.Schema$MessagePart) => {
        if (part.filename && part.filename.length > 0) {
          const attachment = {
            filename: part.filename,
            mimeType: part.mimeType,
            data: part.body.data,
            url: `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}/attachments/${part.body.attachmentId}`,
          };
          attachments.push(attachment);
        }
      });
    }

    return attachments;
  }

  /**
   * Extracts headers from an email message.
   * @param {Object} message - The message object containing the email data.
   * @returns {Array} - An array of header objects from the email message.
   */
  private extractHeaders(
    message: MessageInterface,
  ): gmail_v1.Schema$MessagePartHeader[] {
    return message.payload.headers;
  }

  /**
   * Constructs a mail information object from the given parameters.
   * @param {string} id - The identifier for the Gmail account.
   * @param {Object} message - The message object containing the email data.
   * @param {Array} headers - An array of header objects from the email message.
   * @param {Array} attachments - An array of attachment objects from the email message.
   * @returns {Object} - The constructed mail information object.
   */
  private constructMailInfoObject(
    id: string,
    message: MessageInterface,
    headers: gmail_v1.Schema$MessagePartHeader[],
    attachments: AttachmentsResponseInterface[],
  ): ThreadInterface {
    return {
      account_id: id,
      subject: headers.find(
        (header: { name: string }) => header.name === 'Subject',
      )?.value,
      from: headers.find((header: { name: string }) => header.name === 'From')
        ?.value,
      cc: headers.find((header: { name: string }) => header.name === 'Cc')
        ?.value,
      to: headers.find((header: { name: string }) => header.name === 'To')
        ?.value,
      bcc: headers.find((header: { name: string }) => header.name === 'Bcc')
        ?.value,
      date: new Date(
        headers.find((header: { name: string }) => header.name === 'Date')
          ?.value ?? '',
      ),
      body: this.getBody(message),
      attachments: attachments,
      label_ids: message.labelIds,
      thread_id: null,
    };
  }

  /**
   * Retrieves and decodes the body of an email message. It handles different cases for the message body's location and decodes it from base64URL format.
   * @param {MessageInterface} message - The message object containing the email data.
   * @returns {string} - The decoded string of the email body.
   */
  getBody(message: MessageInterface): string {
    try {
      const encodedBody = this.findEncodedBody(message);
      return this.decodeBody(encodedBody);
    } catch (error) {
      console.error('Error in getBody:', error);
      return '';
    }
  }

  /**
   * Finds the encoded body of an email message. It checks if the body is located in 'parts' or directly in the payload.
   * @param {MessageInterface} message - The message object containing the email data.
   * @returns {string} - The encoded body string of the email.
   */
  private findEncodedBody(message: MessageInterface): string | null {
    if (message.payload.parts) {
      const part =
        this.findBodyPart(message.payload.parts, 'text/html') ||
        this.findBodyPart(message.payload.parts, 'text/plain');
      return part ? part.body.data : '';
    } else {
      return message.payload.body.data;
    }
  }

  /**
   * Finds a specific part of an email message with a given MIME type, commonly used to locate the 'text/html' or 'text/plain' parts.
   * @param {gmail_v1.Schema$MessagePart[]} parts - The parts array of the email message payload.
   * @param {string} mimeType - The MIME type to search for in the parts.
   * @returns {gmail_v1.Schema$MessagePart} - The part of the email that matches the specified MIME type.
   */
  private findBodyPart(
    parts: gmail_v1.Schema$MessagePart[],
    mimeType: string,
  ): gmail_v1.Schema$MessagePart {
    return parts.find(
      (part: gmail_v1.Schema$MessagePart) => part.mimeType === mimeType,
    );
  }

  /**
   * Decodes a base64URL-encoded string. Primarily used for decoding the encoded email body.
   * @param {string} encodedBody - The base64URL-encoded string of the email body.
   * @returns {string} - The decoded string of the email body.
   */
  private decodeBody(encodedBody: string): string {
    if (!encodedBody) return '';
    const buff = Buffer.from(
      encodedBody.replace(/-/g, '+').replace(/_/g, '/'),
      'base64',
    );
    return buff.toString('utf-8');
  }

  /**
   * Fetches detailed information for a specific email message using the Gmail API.
   * @param {string} messageId - The identifier of the email message.
   * @param {OAuth2Client} oAuth2Client - The OAuth2 client for making authenticated requests to the Gmail API.
   * @returns {Promise<MessageInterface>} - A promise that resolves to the details of the specified email message.
   */
  async getEmailDetails(
    messageId: string,
    oAuth2Client: OAuth2Client,
  ): Promise<MessageInterface> {
    try {
      const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
      const response = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });
      return response.data as MessageInterface;
    } catch (error) {
      console.error('Error in getEmailDetails:', error);
      return null;
    }
  }

  /**
   * Retrieves a paginated list of email threads for a specific account from the Gmail thread repository.
   * @param {string} accountId - The identifier of the Gmail account.
   * @param {number} page - The page number for pagination.
   * @param {number} pageSize - The number of threads to retrieve per page.
   * @returns {Promise<GmailThreads[]>} - A promise that resolves to an array of Gmail threads for the specified account and page.
   */
  async getThreadsByAccountAndPage(
    accountId: string,
    page: number,
    pageSize: number,
  ): Promise<GmailThreads[]> {
    try {
      const offset = (page - 1) * pageSize;

      return await this.gmailThreadRepository.find({
        where: { account_id: accountId },
        take: pageSize,
        skip: offset,
        order: { date: 'DESC' },
      });
    } catch (error) {
      console.error('Error in getThreadsByAccountAndPage:', error);
      return [];
    }
  }

  /**
   * Moves a message to trash in Gmail and updates the database.
   * @param id The user's identifier.
   * @param threadId The identifier of the email thread.
   */
  async moveToTrash(
    id: string,
    threadId: string,
  ): Promise<ResponseMessageInterface> {
    try {
      await this.updateGmailLabel(id, threadId, true);
      await this.updateThreadRecord(threadId, true);
      return customMessage(HttpStatus.OK, MESSAGE.SUCCESS);
    } catch (error) {
      console.error('Error in update:', error);
      customMessage(HttpStatus.BAD_REQUEST, MESSAGE.BAD_REQUEST);
    }
  }

  /**
   * Restores a message from the trash in Gmail and updates the database.
   * @param id The user's identifier.
   * @param threadId The identifier of the email thread.
   */
  async restoreFromTrash(
    id: string,
    threadId: string,
  ): Promise<ResponseMessageInterface> {
    try {
      await this.updateGmailLabel(id, threadId, false);
      await this.updateThreadRecord(threadId, false);
      return customMessage(HttpStatus.OK, MESSAGE.SUCCESS);
    } catch (error) {
      console.error('Error in update:', error);
      customMessage(HttpStatus.BAD_REQUEST, MESSAGE.BAD_REQUEST);
    }
  }
  /**
   * Updates the Gmail label by trashing or untrashing the email.
   * @param userId The user's identifier.
   * @param threadId The identifier of the email thread.
   * @param isTrash Indicates if the operation is trashing or untrashing.
   */
  private async updateGmailLabel(
    userId: string,
    threadId: string,
    isTrash: boolean,
  ): Promise<void> {
    const oAuth2Client = await this.prepareOAuthClient(userId);
    if (!oAuth2Client) {
      throw new Error('OAuth2 client initialization failed');
    }

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    if (isTrash) {
      await gmail.users.messages.trash({ userId: 'me', id: threadId });
      return;
    }

    await gmail.users.messages.untrash({ userId: 'me', id: threadId });
  }

  /**
   * Updates the database record for a Gmail thread.
   * @param threadId The identifier of the email thread.
   * @param isTrash Indicates if the operation is trashing or untrashing.
   */
  private async updateThreadRecord(
    threadId: string,
    isTrash: boolean,
  ): Promise<void> {
    const thread = await this.gmailThreadRepository.findOne({
      where: { thread_id: threadId },
    });
    if (!thread) {
      throw new Error('Thread not found');
    }

    const labelIds = new Set(thread.label_ids);
    if (isTrash) {
      labelIds.add('TRASH');
    } else {
      labelIds.delete('TRASH');
      labelIds.add('INBOX');
    }

    await this.gmailThreadRepository.update(
      { thread_id: threadId },
      { label_ids: Array.from(labelIds) },
    );
  }
}
