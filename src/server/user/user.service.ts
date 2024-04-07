import PrismaManager from '@/prisma';
import { Catch, Injectable } from '@nestjs/common';
import * as general from "@/utils/general";
import * as m_crypto from "@/utils/crypto";
import { saveBase64Iamge, saveImage } from '@/utils/File/upload';
import fs from 'fs';
import {  UserDetail } from '@prisma/client';
import { UserIM } from './UserIM';

@Injectable()
export class UserService {



    async register(loginInfo : LoginType)
    {
        // let decryptedCookie = m_crypto.decryptEncryptedCookie(encryptedCookie);

        return await PrismaManager.transaction(async (prisma) =>
        {
            let userLoginRecord = await prisma.login.findFirst({
                where : {
                    username : loginInfo.username
                }
            });

            if(userLoginRecord)
            {
                throw new Error(`[Register Error] username ${loginInfo.username} has exists`);
            }

            let currentTime = general.time();

            await prisma.login.create({
                data : {
                    id : general.generateId(),
                    username : loginInfo.username,
                    password : loginInfo.password,
                    registerTime : currentTime
                }
            });

            return "Register Successfully";

        })
    }
    
    async checkLogin(loginInfo : LoginType) : Promise<{cookie : string, id : number, username : string}>
    {
        return await PrismaManager.transaction(async (prisma) =>
        {
            let userLoginRecord = await  prisma.login.findFirst({
                where : {
                    username : loginInfo.username
                }
            });

            if(!userLoginRecord)
            {
                throw new Error(`[Login Error] username ${loginInfo.username} not found`);
            }

            if(userLoginRecord.password !== loginInfo.password)
            {
                throw new Error(`[Login Error] username ${loginInfo.username} with error password`);
            }

            await prisma.login.update({
                data : {
                    loginTime : general.time()
                },
                where : {
                    id : userLoginRecord.id
                }
            })

            let encryptedCookie = m_crypto.generateCookie(userLoginRecord.id);
            return {
                cookie : encryptedCookie,
                id : userLoginRecord.id,
                username : userLoginRecord.username
            }
        })
    }

    async userMessageSubmit(userId : number, userMessage : UserMessage)
    {
        let imageFile = '';
        if(userMessage.avatarFile)
        {
            imageFile = await saveBase64Iamge(userMessage.avatarFile as string);
        }

        return await PrismaManager.transaction(async (prisma) =>
        {
            let userDetail =  await prisma.userDetail.findFirst({
                where : {
                    userId : userId
                }
            });

            let detailObj : UserDetail = {
                ...userDetail,
                userId : userId,
                avatarURL : imageFile || userDetail?.avatarURL || '',
                nickname : userMessage.nickname,
                description : userMessage.description,
                address : userMessage.address,
                firstName : userMessage.firstName,
                lastName : userMessage.lastName,
                school : userMessage.school,
                gender : +userMessage.gender,
                birthday : userMessage.birthday,
                email : userMessage.email,
                id : userDetail?.id || general.generateId()
            }

            if(!userDetail)
            {
                await prisma.userDetail.create({
                    data : detailObj
                });

                await this.bindRemoteIMUserSig(detailObj.nickname, userId);
            }
            else{
                await prisma.userDetail.update({
                    data : detailObj,
                    where : {
                        id : userDetail.id
                    }
                })
            }
            
            return {
                userDetail : detailObj,
                message : "Submit Successfully"
            }

        })
    }

    async bringUserDetail(userId : number)
    {
        return await PrismaManager.transaction(async (prisma) => {
            let userDetail = await prisma.userDetail.findFirst({
                where : {
                    userId : userId
                }
            });

            // if(!userDetail)
            // {
            //     throw new Error(`[User Detail Error] User ${userId} not found`);
            // }

            return userDetail;
        })
    }

    async userDetail(userId : number, isSelf : boolean)
    {
        let userDetail = await PrismaManager.getPrisma().userDetail.findFirst({
            where : {
                userId : userId
            }
        });

        if(!userDetail)
        {
            return {
                userId
            };
        }

        let followObj = await this.getFollowerNumber(userId);
        let retUserDetail = {
            ...userDetail,
            ...followObj
        }

        return retUserDetail;
    }

    async userFollow(followedId : number, followerId : number)
    {
        let followRecord = await PrismaManager.getPrisma().userFollow.findFirst({
            where : {
                followedId,
                followerId
            }
        })

        if(followRecord)
        {
            return "Already Followed";
        }

        await PrismaManager.transaction(async (prisma) =>
        {
            await prisma.userFollow.create({
                data : {
                    id : general.generateId(),
                    followedId,
                    followerId,
                    followTime : general.time()
                }
            })
        })
        
        return "follow success";
    }

    async userFollowCancel(followedId : number, followerId : number)
    {
        let followRecord = await PrismaManager.getPrisma().userFollow.findFirst({
            where : {
                followedId,
                followerId
            }
        })

        if(!followRecord)
        {
            return "followed relation does not exists";
        }

        return PrismaManager.transaction(async (prisma) =>
        {
            await prisma.userFollow.delete({
                where : {
                    id : followRecord.id
                }
            })

            return "cancel follow relation success"
        })

        
    }

    async getFollowStatus(followedId : number, followerId : number)
    {
        
        let followRecord = await PrismaManager.getPrisma().userFollow.findFirst({
            where : {
                followedId,
                followerId
            }
        })

        return followRecord ? true : false;
    }

    /**
     * 关注/粉丝数量
     */
    async getFollowerNumber(userId : number)
    {
        // 粉丝
        let sql = `SELECT count("followedId") as "followerNumber" FROM "Community"."UserFollow"
        WHERE "followedId" = ${userId}
        `

        let sql2 = `
            SELECT count("followerId") as "followedNumber" FROM "Community"."UserFollow"
            WHERE "followerId" = ${userId}
        `

        let {followerNumber} = await PrismaManager.QueryFirst(sql);
        let {followedNumber} = await PrismaManager.QueryFirst(sql2);
        return {followerNumber, followedNumber};
    }

    async bindRemoteIMUserSig(nickName : string, userId : number)
    {
        await new UserIM().createIMRecord(nickName, userId);
    }

    async userSearch(keyword : string)
    {
        let sql = `
            SELECT * FROM "Community"."UserDetail"
            WHERE "nickname" LIKE '%${keyword}%'
        `

        return await PrismaManager.execute(sql);
    }

    async GetUserFollower(userId : number)
    {
        let sql = `
            SELECT ud.* FROM "Community"."UserDetail" as ud
            LEFT JOIN "Community"."UserFollow" as uf on ud."userId" = uf."followerId"
            WHERE uf."followedId" = ${userId}
        `

        return await PrismaManager.execute(sql);
    
    }

    async GetUserFollowed(userId : number)
    {
        let sql = `
            SELECT ud.* FROM "Community"."UserDetail" as ud
            LEFT JOIN "Community"."UserFollow" as uf on ud."userId" = uf."followedId"
            WHERE uf."followerId" = ${userId}
        `

        return await PrismaManager.execute(sql);
    }
}


export interface LoginType
{
    username : string,
    password : string
}

export interface UserMessage
{
    nickname : string,
    description : string,
    address : string,
    avatarFile? : File | string,
    firstName : string,
    lastName : string,
    gender : number,
    school : string,
    birthday : number,
    email : string,
    
}
