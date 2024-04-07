import { Body, Catch, Controller, Get, Post, Req, UseFilters, UseGuards } from '@nestjs/common';
import { UserService, LoginType } from './user.service';
import PrismaManager from '@/prisma';
import { HttpExceptionFilter } from '@/http-exception.filter';
import { Request } from 'express';
import * as m_crypto from '@/utils/crypto';
import { CookieAuthGuard } from '@/cookieGuard.guard';

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
        console.log(body);
        let userRet = await this.loginService.checkLogin(body);
        let userDetail = await this.loginService.bringUserDetail(userRet.id);
        return {
            ...userRet,
            userDetail
        }
    }

    @Post("user_message_submit")
    @UseGuards(CookieAuthGuard)
    userMessageSubmit(@Body() body : any, @Req() req : any)
    {
        console.log(body)
        return this.loginService.userMessageSubmit(+req.query.user_id, body);
    }

    @Get("user_detail")
    async userDetail(@Req() req : Request)
    {
        let cookie = req.cookies;
        let user_id = req.query.user_id;
        let isSelf = false;
        if(!user_id)
        {
            throw new Error("user_id is empty");
        }

        // try{
        //     let decryptedToken =  JSON.parse(m_crypto.decryptEncryptedCookie(cookie.token));
        //     isSelf = decryptedToken.id === userId;
        // }catch(err)
        // {
        //     console.log(err);
        //     isSelf = false;
        // }
        let userInfo = await this.loginService.userDetail(+(user_id as string), isSelf);
        console.log(userInfo)
        return userInfo;
    }

    @Post("user_follow")
    @UseGuards(CookieAuthGuard)
    async userFollow(@Req() req : Request, @Body() body : {followedId : number})
    {
        let userId = req.query.user_id;
        if(!userId)
            throw new Error("No User Id Provided");
        return this.loginService.userFollow(+body.followedId, +userId);
    }

    @Post("user_follow_cancel")
    @UseGuards(CookieAuthGuard)
    async userFollowCancel(@Req() req : Request, @Body() body : {followedId : number})
    {
        let userId = req.query.user_id;
        if(!userId)
            throw new Error("No User Id Provided");
        return this.loginService.userFollowCancel(+body.followedId, +userId);
    }

    @Get('follow_status')
    async getFollowStatus(@Req() req : Request)
    {
        let followerId = req.query.follower_id as string;
        let followedId = req.query.followed_id as string;
        if(!followedId || !followerId)
            throw new Error("No Query Params")

        return this.loginService.getFollowStatus(+followedId, +followerId);
    }

    @Get("remote_im")
    async UserIM()
    {
        // return this.loginService.bindRemoteIMUserSig('');
        return "demo"
    }

    @Get("check_user_cookie")
    async UserCookieCheck(@Req() req : Request)
    {
        const cookie = req.cookies;
        const userId = +(req.query.user_id as string);
        console.log(userId, cookie);
        if(!userId)
            throw new Error("user Token is unAuthorized");

        return !m_crypto.cookieExipred(cookie.token, userId);
    }

    @Get("search_user")
    async UserSearch(@Req() req : Request)
    {
        let keywords = req.query.keywords as string;
        if(!keywords)
            throw new Error("No Keywords Query Provided");

        return this.loginService.userSearch(keywords);
    }

    @Get("follower_user")
    @UseGuards(CookieAuthGuard)
    async GetUserFollower(@Req() req : Request)
    {
        let userId = req.query.user_id as string;
        if(!userId)
            throw new Error("No User Id Provided");

        return this.loginService.GetUserFollower(+userId);
    }

    @Get("followed_user")
    @UseGuards(CookieAuthGuard)
    async GetUserFollowed(@Req() req : Request)
    {
        let userId = req.query.user_id as string;
        if(!userId)
            throw new Error("No User Id Provided");

        return this.loginService.GetUserFollowed(+userId);
    }
}


