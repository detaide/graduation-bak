import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import * as m_crypto from '@/utils/crypto';

@Injectable()
export class CookieAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    console.log('Cookies:', request.cookies); // 获取请求携带的所有 Cookie

    try{
        if(m_crypto.cookieExipred(request.cookies.token, request.query.user_id as unknown as number))
        {
            response.status(401).send("Cookie Expired");
            return;
        }
    }catch(err)
    {
        console.log(err);
        response.status(401).send("Cookie Expired");
        return;
    }

    // Add your authentication logic here
    return true; // Return true if the request should be allowed
  }
}