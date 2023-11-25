/**
 * Data Transfer Object for download attacgment.
 *
 * This class defines the data structure and validation rules for
 * downloading attachments through provided URL and other properties.
 *
 */
export class DownloadAttachmentDto {
  url: string;
  filename: string;
  mimeType: string;
}
