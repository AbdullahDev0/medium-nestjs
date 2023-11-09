/**
 * main.ts: Entry point for the NestJS application.
 * Loads configuration, sets up the application, and starts the server.
 */

// Load and apply configuration based on the current environment.
import { loadConfig } from './shared/utils/config';
loadConfig();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Alternative dotenv configuration loading method.
const environment = process.env.NODE_ENV || 'local';
dotenv.config({ path: `${environment}.env` });

/**
 * Initializes and starts the NestJS application.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT || 3000);
}

bootstrap(); // Execute the application bootstrap function.
