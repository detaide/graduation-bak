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

        let imgURLMap = {};

        if(channelItemInfo.imgFileList)
        {
            channelItemInfo.imgFileList.forEach(async (imgFile, index) =>
            {
                let imageFile = await saveBase64Iamge(imgFile);
                imgURLMap[index] = imageFile;
            })
        }


        return await PrismaManager.transaction(async (prisma) =>
        {


            await prisma.channelItems.create({
                data : {
                    id : general.generateId(),
                    channelId : +channelItemInfo.channelId,
                    title : channelItemInfo.title,
                    comment : channelItemInfo.comment,
                    publishTime : general.time(),
                    ownerId : +channelItemInfo.userId as number,
                    imgURL : JSON.stringify(imgURLMap)
                }
            });

            return "Create Channel Item Successfully";
        })
    }

    async bringChannelItemInfo(channelId: number) {
        let sql = `
        SELECT ci.*, ud."nickname", ud."avatarURL", cic."commentNumber" FROM "Community"."ChannelItems" as ci
        LEFT JOIN "Community"."UserDetail" as ud on ud."userId" = ci."ownerId"
        left join (
            select "channelItemId", count("channelItemId") as "commentNumber" from "Community"."ChannelItemComment"
            group by "channelItemId"
        ) as cic on cic."channelItemId" = ci."id"
            WHERE "channelId" = ${channelId} ORDER BY "publishTime" DESC
        `
        return PrismaManager.execute(sql);

        // return await PrismaManager.getPrisma().channelItems.findMany({
        //     where : {
        //         channelId : channelId
        //     },
        //     orderBy : {
        //         publishTime : 'desc'
        //     }
        // });
    }

    async createChannelItemComment(channelItemCommentInfo: ChannelItemCommentReq) {
        console.log("channelItemCommentInfo" ,channelItemCommentInfo)
        return await PrismaManager.transaction(async (prisma) =>
        {
            await prisma.channelItemComment.create({
                data : {
                    id : general.generateId(),
                    channelItemId : channelItemCommentInfo.channelItemId,
                    comment : channelItemCommentInfo.comment,
                    publishTime : general.time(),
                    userId : channelItemCommentInfo.userId as number,
                    thumbs : 0
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

    async bringChannelDetailByName(channelName: string) {
        let sql = `
        select ch.*, ud."nickname", ud."avatarURL", cf."follow", ci."itemNumber" from "Community"."Channel" as ch
        LEFT JOIN "Community"."UserDetail" as ud on ud."userId" = ch."ownerId"
        left join (
        select "channelId", count("channelId") as "follow" from "Community"."ChannelFollow"
        group by "channelId"
        ) as cf on cf."channelId" = ch."id"
        left join (
        select "channelId", count("channelId") as "itemNumber" from "Community"."ChannelItems"
        group by "channelId"
        ) as ci on ci."channelId" = ch."id"
        WHERE ch."name" = '${channelName}'
        order by ch."createTime" DESC
        `

        let channelData = await PrismaManager.QueryFirst(sql);
        channelData.typeName = ChannelType.getChannelName(channelData.type);
        return channelData;
    }

    async bringChannelItemDetail(channelItemId: number) {
        let sql = `
                select ci.*, ch."name", ch."type", ch."imgURL"  as "channelImg", ch."memo", ch."ownerId" as "channelOwnerId", 
                ud."nickname", ud."userId", ud."avatarURL"
            from "Community"."ChannelItems" as ci
                        LEFT JOIN "Community"."Channel" as ch on ch."id" = ci."channelId"
                        LEFT JOIN "Community"."UserDetail" as ud on ud."userId" = ci."ownerId"
            WHERE ci."id" = ${channelItemId}
        `

        let channelItemData = await PrismaManager.QueryFirst(sql);
        channelItemData.typeName = ChannelType.getChannelName(channelItemData.type);

        let sql2 = `
            select cic.*, ud."nickname", ud."avatarURL", ci."ownerId" as "commentOwnerId"  from "Community"."ChannelItemComment" as cic
            left join "Community"."UserDetail" as ud on ud."userId" = cic."userId"
            left join "Community"."ChannelItems" as ci on ci."id" = cic."channelItemId"
            where cic."channelItemId" = ${channelItemId}
            order by cic."publishTime" ASC
        `

        let subCommentItemData = await PrismaManager.execute(sql2);
        channelItemData.subCommentItemData = subCommentItemData;

        return channelItemData;
    }

    async addChannelScanNumber(channelId: number) {
        return await PrismaManager.transaction(async (prisma) =>
        {
            let channel = await prisma.channel.findFirst({
                where : {
                    id : channelId
                }
            });

            if(!channel)
                throw new Error("Channel Not Found");

            await prisma.channel.update({
                data : {
                    scanNumber : channel.scanNumber + 1
                },
                where : {
                    id : channelId
                }
            })
        })
    }

    async bringChannelItemByUserId(userId: number) {
        let sql = `
            select ci.*, ch."name", ch."type", ch."imgURL"  as "channelImg", ch."memo", ch."ownerId" as "channelOwnerId", 
            ud."nickname", ud."userId", ud."avatarURL"
        from "Community"."ChannelItems" as ci
                    LEFT JOIN "Community"."Channel" as ch on ch."id" = ci."channelId"
                    LEFT JOIN "Community"."UserDetail" as ud on ud."userId" = ci."ownerId"
        WHERE ci."ownerId" = ${userId}
        order by ci."publishTime" DESC
        `

        return PrismaManager.execute(sql);
    }

    async bringAllChannelItem()
    {
        let sql = `
        select ci.*, ch."name", ch."type", ch."imgURL"  as "channelImg", ch."memo", ch."ownerId" as "channelOwnerId", 
            ud."nickname", ud."userId", ud."avatarURL"
        from "Community"."ChannelItems" as ci
                    LEFT JOIN "Community"."Channel" as ch on ch."id" = ci."channelId"
                    LEFT JOIN "Community"."UserDetail" as ud on ud."userId" = ci."ownerId"
        order by ci."publishTime" DESC
        `

        return PrismaManager.execute(sql);
    
    }

    async bringAllChannel()
    {
        let sql = `
        select *, cf."follow", ci."itemNumber" from "Community"."Channel" as ch
        left join (
            select "channelId", count("channelId") as "follow" from "Community"."ChannelFollow"
            group by "channelId"
        ) as cf on cf."channelId" = ch."id"
        left join (
            select "channelId", count("channelId") as "itemNumber" from "Community"."ChannelItems"
            group by "channelId"
        ) as ci on ci."channelId" = ch."id"
        order by "createTime" DESC
        `

        return PrismaManager.execute(sql);
    }

    async followChannel(userId: number, channelId: number) {
        return await this.channelFollow(userId, +channelId);
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
    comment  : string,
    userId? : number,
    imgURLList? : string[],
    imgFileList? : string[]
}

export interface ChannelItemCommentReq
{
    channelItemId : number,
    comment : string,
    userId? : number
}