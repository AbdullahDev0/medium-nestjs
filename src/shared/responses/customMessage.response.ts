import { ResponseMessageInterface } from '../utils/interfaces';

/**
 * Constructs a response message object.
 *
 * This function generates a standard format for API response messages. It encapsulates the status code,
 * a message, and any additional data into a structured object.
 *
 * @param {number} statusCode - The HTTP status code associated with the response.
 * @param {string} message - The main message to be conveyed in the response.
 * @param {object} [data={}] - Optional data to be included in the response. Defaults to an empty object if not provided.
 * @returns {responseMessageInterface} An object conforming to the responseMessageInterface structure.
 */

function customMessage(
  statusCode: number,
  message: string,
  data = {},
): ResponseMessageInterface {
  return {
    statusCode: statusCode,
    message: [message],
    data: data,
  };
}
export default customMessage;
