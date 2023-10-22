import * as dotenv from 'dotenv'; // Import the dotenv library
import * as fs from 'fs'; // Import the filesystem library

export function loadConfig() {
  // Ascertain the active environment, or default to 'local'
  const environment = process.env.NODE_ENV || 'local';

  // Extract and interpret the .env file corresponding to the identified environment
  const data: any = dotenv.parse(fs.readFileSync(`${environment}.env`));

  // Assign the extracted variables to process.env
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      process.env[key] = data[key];
    }
  }
}
