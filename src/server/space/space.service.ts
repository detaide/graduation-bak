import PrismaManager from '@/prisma';
import { Injectable } from '@nestjs/common';
import * as general from "@/utils/general"
import { Prisma } from '@prisma/client';

@Injectable()
export class SpaceService {

    async publish(publishInfo : PublishInfoType)
    {
        return await PrismaManager.transaction(async (prisma) =>
        {
            let currentTime = general.time();
            await prisma.space.create({
                data : {
                    id : general.generateId(),
                    title : publishInfo.title,
                    info : publishInfo.info,
                    publishTime : currentTime,
                    scanNumber : 0,
                    userId : publishInfo.userId,
                    type : publishInfo.type
                }
            });
            
            return "Publish Successfully";
        })
    }

    async bringAllSpace()
    {
        return PrismaManager.getPrisma().space.findMany(
            {
                orderBy : {
                    publishTime : 'desc'
                
                }
            }
        );
    }

    async bringSpaceDetail(space_id : number)
    {
        return await PrismaManager.getPrisma().space.findFirst({
            where : {
                id : space_id
            }
        });
    }

    async publishComment(body : PublishCommentType)
    {

        return await PrismaManager.transaction(async (prisma) =>
        {
            let currentTime = general.time();
            let newSpaceComment = await prisma.spaceComment.create({
                data : {
                    id : general.generateId(),
                    spaceId : body.spaceId,
                    comment : body.comment,
                    publishTime : currentTime,
                    userId : body.userId,
                    thumbs : 0
                }
            });
            
            let spaceCommentInfo = await this.bringSpaceCommentById(newSpaceComment.id);

            return spaceCommentInfo;
        })
    }

    async bringSpaceCommentBySpaceId(spaceId : number)
    {
        let sql = `SELECT pc.*, ud."nickname", ud."avatarURL" from "Community"."SpaceComment" as pc
        LEFT JOIN "Community"."UserDetail" as ud on ud."userId" = pc."userId"
        WHERE pc."spaceId" = ${spaceId} ORDER BY pc."publishTime" DESC
        `
        
        let info = await PrismaManager.execute(sql);
        return info;
    }

    async bringSpaceCommentById(id : number)
    {
        let sql = `SELECT pc.*, ud."nickname", ud."avatarURL" from "Community"."SpaceComment" as pc
        LEFT JOIN "Community"."UserDetail" as ud on ud."userId" = pc."userId"
        WHERE pc."id" = ${id} ORDER BY pc."publishTime" DESC LIMIT 1
        `
        
        let info = await PrismaManager.QueryFirst(sql);
        return info;
    }

    async bringSpaceByUserId(id : number)
    {
        return await PrismaManager.getPrisma().space.findMany({
            where : {
                userId : id
            },
            orderBy : {
                publishTime : 'desc'
            }
        });
    }

    async addThumbsbyId(id : number)
    {
        return await PrismaManager.getPrisma().spaceComment.update({
            where : {
                id : id
            },
            data : {
                thumbs : {
                    increment : 1
                }
            }
        });
    
    }

}


export interface PublishInfoType
{
    title : string,
    info : string,
    userId? : number,
    type? : number
}

export interface PublishCommentType
{
    spaceId : number,
    comment : string,
    userId : number
}