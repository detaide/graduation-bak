import PrismaManager from '@/prisma';
import { Injectable } from '@nestjs/common';
import { saveBase64Iamge } from "@/utils/File/upload";
import {ChannelType} from './channelType';
import * as general from "@/utils/general";


@Injectable()
export class ChannelService {
    async createChannel(channelInfo: ChannelRes) {
        let channel = await PrismaManager.getPrisma().channel.findFirst({
            where : {
                name : channelInfo.name
            }
        });

        if(channel)
            throw new Error(`Channel ${channelInfo.name} has exists`);

        let imageFile = '';
        if(channelInfo.imgFile)
        {
            imageFile = await saveBase64Iamge(channelInfo.imgFile as string);
        }

        return await PrismaManager.transaction(async (prisma) =>
        {
            let newChannel = await prisma.channel.create({
                data : {
                    id : general.generateId(),
                    ownerId : channelInfo.userId as number,
                    scanNumber : 0,
                    createTime : general.time(),
                    name : channelInfo.name,
                    type : +channelInfo.type as number,
                    memo : channelInfo.memo,
                    imgURL : imageFile
                }
            });

            await this.channelFollow(channelInfo.userId as number, newChannel.id as number);

            return "Create Channel Successfully";
        })
        
    }

    async getAllChannel() {
        return await PrismaManager.getPrisma().channel.findMany();
    }

    async createChannelItem(channelItemInfo: ChannelItemReq) {
        return await PrismaManager.transaction(async (prisma) =>
        {
            await prisma.channelItems.create({
                data : {
                    id : general.generateId(),
                    channelId : channelItemInfo.channelId,
                    title : channelItemInfo.title,
                    info : channelItemInfo.info,
                    publishTime : general.time(),
                    ownerId : channelItemInfo.userId as number
                }
            });

            return "Create Channel Item Successfully";
        })
    }

    async bringChannelItemInfo(channelId: number) {
        return await PrismaManager.getPrisma().channelItems.findMany({
            where : {
                channelId : channelId
            },
            orderBy : {
                publishTime : 'desc'
            }
        });
    }

    async createChannelItemComment(channelItemCommentInfo: ChannelItemCommentReq) {
        return await PrismaManager.transaction(async (prisma) =>
        {
            await prisma.channelItemComment.create({
                data : {
                    id : general.generateId(),
                    channelItemId : channelItemCommentInfo.channleItemId,
                    comment : channelItemCommentInfo.comment,
                    publishTime : general.time(),
                    userId : channelItemCommentInfo.userId as number
                }
            });

            return "Create Channel Item Comment Successfully";
        })
    }

    async getChannelType() {
        return ChannelType.channelType;
    }

    async channelFollow(userId: number, channelId: number) {
        return await PrismaManager.transaction(async (prisma) =>
        {
            let follow = await prisma.channelFollow.findFirst({
                where : {
                    userId : userId,
                    channelId : channelId
                }
            });

            if(follow)
            {
               await prisma.channelFollow.update({
                    data : {
                        followTime : general.time()
                    },
                    where : {
                        id : follow.id
                    }
               })
               return;
            }

            await prisma.channelFollow.create({
                data : {
                    id : general.generateId(),
                    userId : userId,
                    channelId : channelId,
                    followTime : general.time()
                }
            })
            
        })
    }

    async getChannelFollowByUserId(userId: number) {
        let sql = `SELECT fl.*, ch."name", ch."type", ch."imgURL", ch."memo" FROM "Community"."ChannelFollow" as fl 
            LEFT JOIN "Community"."Channel" as ch on ch."id" = fl."channelId"
            WHERE fl."userId" = ${userId}
            ORDER BY fl."followTime" DESC
        `

        return PrismaManager.execute(sql);
    }
}


export interface ChannelRes{
    name : string,
    type : number | string,
    memo : string,
    imgURL? : string,
    userId? : number,
    imgFile? : string
}


export interface ChannelItemReq
{
    channelId : number,
    title : string,
    info  : string,
    userId? : number,
}

export interface ChannelItemCommentReq
{
    channleItemId : number,
    comment : string,
    userId? : number
}