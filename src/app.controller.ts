/**
 * Root controller for the application.
 *
 * This controller manages the main HTTP route and handles the primary endpoint of the application.
 * It utilizes the AppService to execute business logic when responding to HTTP GET requests.
 *
 * @class AppController
 * @decorator Controller - Sets the base route for this controller.
 *
 * @method getHello - Endpoint to retrieve a greeting message. Responds to HTTP GET requests.
 */

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
