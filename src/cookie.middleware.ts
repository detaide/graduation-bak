import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as m_crypto from '@/utils/crypto';

@Injectable()
export class CookieMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Cookies:', req.cookies); // 获取请求携带的所有 Cookie
    try{
        if(m_crypto.cookieExipred(req.cookies.token, req.query.userId as unknown as number))
        {
            res.status(401).send("Cookie Expired");
            return;
        }
    }catch(err)
    {
        console.log(err);
        res.status(401).send("Cookie Expired");
        return;
    }
 
    next(); 
  }
}


export interface CookieType
{
    token : string
}

export interface ParserCookie
{
    id : number,
    expireTime : number
}