import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as m_crypto from '@/utils/crypto';

@Injectable()
export class RequestMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // console.log(req)
    console.log(`[request ${new Date().toLocaleString() } ${req.method} ]-[${req.baseUrl}]`);
 
    next(); 
  }
}
