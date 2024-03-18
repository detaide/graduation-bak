import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

// @Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: Error | HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = 200;

    Logger.error(`[HTTP Error] Reason : ${exception.message}`)

    response
      .status(status)
      .json({
        status : 1001,
        timestamp: new Date().toISOString(),
        path: request.url,
        message : exception.message
      });
  }
}
