import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Extracts and returns the error message from an exception.
 * @param exception - The exception object to extract the message from.
 * @returns The error message as a string.
 */
export const getErrorMessage = <T extends Error>(exception: T): string => {
  return exception instanceof HttpException
    ? exception.message
    : String(exception);
};

/**
 * Custom exception filter for handling HttpExceptions.
 * @catches HttpException - Specifies the type of exception this filter handles.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  /**
   * Method to handle caught HttpException.
   * @param exception - The caught HttpException object.
   * @param host - The arguments host object for retrieving additional request/response details.
   */
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const errorResponse = exception.getResponse();
    const message =
      typeof errorResponse === 'string'
        ? errorResponse
        : errorResponse['message'];

    response.status(status).json({
      statusCode: status,
      message: message,
      data: {},
    });
  }
}
