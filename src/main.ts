// Loading config before anything
import { loadConfig } from './shared/utils/config';
loadConfig();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Another way of loading env file, use as per your preference
const environment = process.env.NODE_ENV || 'local';
dotenv.config({ path: `${environment}.env` });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
