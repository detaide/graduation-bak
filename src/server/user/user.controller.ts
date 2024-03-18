import { Body, Catch, Controller, Get, Post, Req, UseFilters } from '@nestjs/common';
import { UserService, LoginType } from './user.service';
import PrismaManager from '@/prisma';
import { HttpExceptionFilter } from '@/http-exception.filter';
import { Request } from 'express';
import * as m_crypto from '@/utils/crypto';

@Controller('user')
@UseFilters(new HttpExceptionFilter())
export class UserController {
    constructor(private readonly loginService : UserService) {}

    @Post("register")
    register(@Body() body : LoginType)
    {
        if(!body.username || !body.password)
        {
            throw new Error("[Register Error] parameter is empty");
        }
        
        return this.loginService.register(body);
    }

    @Post("check_login")
    async login(@Body() body : LoginType)
    {
        if(!body.username || !body.password)
        {
            throw new Error("[Register Error] parameter is empty");
        }

        let userRet = await this.loginService.checkLogin(body);
        let userDetail = await this.loginService.bringUserDetail(userRet.id);
        return {
            ...userRet,
            userDetail
        }
    }

    @Post("user_message_submit")
    userMessageSubmit(@Body() body : any, @Req() req : any)
    {
        console.log(body)
        return this.loginService.userMessageSubmit(+req.query.userId, body);
    }

    @Get("user_detail")
    async userDetail(@Req() req : Request)
    {
        let cookie = req.cookies;
        let userId = req.query.userId;
        let isSelf = false;

        try{
            let decryptedToken =  JSON.parse(m_crypto.decryptEncryptedCookie(cookie.token));
            isSelf = decryptedToken.id === userId;
        }catch(err)
        {
            console.log(err);
            isSelf = false;
        }

        return await this.loginService.userDetail(+(userId as string), isSelf);
    }

}


