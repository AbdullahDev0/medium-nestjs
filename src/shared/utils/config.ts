import * as dotenv from 'dotenv';
import * as fs from 'fs';

/**
 * Loads environment-specific configurations.
 *
 * This function first determines the active environment (e.g., 'local', 'development', 'production').
 * It then reads and parses the corresponding .env file (e.g., 'local.env', 'development.env').
 * Finally, it assigns the values from this file to process.env, making them accessible throughout the application.
 */
export function loadConfig() {
  const environment = process.env.NODE_ENV || 'local';
  const data: any = dotenv.parse(fs.readFileSync(`${environment}.env`));
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      process.env[key] = data[key];
    }
  }
}
