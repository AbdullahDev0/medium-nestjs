/**
 * AppService: A service class in a NestJS application.
 * Contains application-specific business logic.
 */

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * getHello(): Method to return a greeting.
   * @returns {string} A simple greeting message.
   */
  getHello(): string {
    return 'Hello World!';
  }
}
