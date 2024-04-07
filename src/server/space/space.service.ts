import PrismaManager from '@/prisma';
import { Injectable } from '@nestjs/common';
import * as general from "@/utils/general"
import { Prisma } from '@prisma/client';
import { SpaceType } from './spaceType';

@Injectable()
export class SpaceService {

    async publish(publishInfo : PublishInfoType)
    {
        console.log(publishInfo)
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
                    type : +publishInfo.type
                }
            });
            
            return "Publish Successfully";
        })
    }

    async bringAllSpace(type? : number, userId? : number)
    {
        let whereCondition = {};
        if(type && Object.keys(SpaceType.spaceType).includes(type.toString()))
        {
            whereCondition = {
                type
            }
        }

        let sqlWhere = ` 1=1 `;
        type && (type !== 100) && (sqlWhere += ` and sp."type" = ${type}`);
        userId && (sqlWhere += ` and sp."userId" = ${userId}`);

        let sql = `
            select sp.*, ud."nickname", ud."avatarURL" from "Community"."Space" as sp
            left join "Community"."UserDetail" as ud on ud."userId" = sp."userId"
            where ${sqlWhere}
            order by ${type === 100 ? 'sp."publishTime" DESC, sp."scanNumber" DESC' : 'sp."scanNumber" DESC, sp."publishTime" desc'}
        `

        let spaceDetail = await PrismaManager.execute(sql) as unknown as Array<any>;
        
        spaceDetail.forEach((item) =>
        {
            item.typeName = SpaceType.getSpaceTypeName(item.type);
        
        })
        return await spaceDetail;
    }

    async bringSpaceByFollow(userId : number)
    {
        let sql = `
            select ss."updateTime", sp.*, ud."nickname", ud."avatarURL" from "Community"."SpaceStar" as ss
            left join "Community"."Space" as sp on sp."id" = ss."spaceId"
            left join "Community"."UserDetail" as ud on ud."userId" = ss."userId"
            where ss."userId" = ${userId}
            order by sp."publishTime" desc
        `
        let spaceDetail = await PrismaManager.execute(sql) as unknown as Array<any>;

        spaceDetail.forEach((item) =>
        {
            item.typeName = SpaceType.getSpaceTypeName(item.type);
        })
        return await spaceDetail;
        
    }

    async bringSpaceDetail(space_id : number)
    {
        
        let sql = `
        select sp.*, sc."spaceComment", ss."spaceStar", ss."spaceLike", ud."nickname", ud."avatarURL" from "Community"."Space" as sp
        left join (
            select "spaceId", count("spaceId") as "spaceComment" from "Community"."SpaceComment"
            where "spaceId" = ${space_id}
            group by "spaceId"
        ) as sc on sc."spaceId" = sp."id"
        left join (
            select "spaceId", sum("star") as "spaceStar", sum("like") as "spaceLike" from "Community"."SpaceStar" 
            where "spaceId" = ${space_id}
            group by "spaceId"
        ) as ss on ss."spaceId" = sp."id"
        left join "Community"."UserDetail" as ud on ud."userId" = sp."userId"
        where sp."id" = ${space_id}
        `

        let spaceInfo = await PrismaManager.QueryFirst(sql);

        let spaceType = SpaceType.getSpaceTypeName(spaceInfo.type);

        return {
            typeName : spaceType,
            ...spaceInfo
        }
    }

    async publishComment(body : PublishCommentType)
    {

        return await PrismaManager.transaction(async (prisma) =>
        {
            let currentTime = general.time();
            let newSpaceComment = await prisma.spaceComment.create({
                data : {
                    id : general.generateId(),
                    spaceId : +body.spaceId,
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
        `;
        
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

    async getSpaceType()
    {
        return SpaceType.spaceType;
    }

    async bringAllSpaceByUserId(userId : number)
    {
        return await PrismaManager.getPrisma().space.findMany({
            where : {
                userId : userId
            }
        })
    }

    async SpaceSearch(keyword : string)
    {
        let sql = `
            select sp.*, ud."nickname", ud."avatarURL", sm."spaceCommentNumber" from "Community"."Space" as sp
            left join "Community"."UserDetail" as ud on ud."userId" = sp."userId"
            left join (
                select "spaceId", count("spaceId") as "spaceCommentNumber" from "Community"."SpaceComment"
                group by "spaceId"
            ) as sm on sm."spaceId" = sp."id"
            WHERE ("title" ILIKE '%${keyword}%' OR sp."info" ILIKE '%${keyword}%')
            ORDER BY sp."publishTime" DESC
        `

        return await PrismaManager.execute(sql);
    }

    // forUser
    async getSpaceGeneral(spaceId : number, userId : number)
    {
        // 个人点赞 | 个人star
        let userSpaceGeneral = await PrismaManager.getPrisma().spaceStar.findFirst({
            where : {
                spaceId,
                userId
            }
        });
        return {...userSpaceGeneral};
    }

    async spaceFollow(userId : number, spaceId : number, type : "Star" | "Like", followStatus : "Add" | "Cancel")
    {
        return await PrismaManager.transaction(async (prisma) =>
        {
            let spaceFollowRecord = await prisma.spaceStar.findFirst({
                where : {
                    userId,
                    spaceId
                }
            });

            if(!spaceFollowRecord && followStatus === 'Cancel')
            {
                throw new Error("非法操作");
            }

            if(!spaceFollowRecord && followStatus === 'Add')
            {
                let currentTime = general.time();
                let newspaceFollowRecord = await prisma.spaceStar.create({
                    data : {
                        id : general.generateId(),
                        userId,
                        spaceId,
                        star : type === "Star" ? 1 : 0,
                        like : type === "Like" ? 1 : 0,
                        updateTime : currentTime
                    }
                });
                return ` ${type} option Successfully`;
            }

            if(spaceFollowRecord.like && type === "Like" && followStatus === "Add")
            {
                throw new Error("已经点赞");
            }
            if(spaceFollowRecord.star && type === "Star" && followStatus === "Add")
            {
                throw new Error("已经收藏");
            }
  
            let likeType = (type === "Like") ? (followStatus === "Add" ? 1 : 0) : spaceFollowRecord.like;
            let starType = (type === "Star") ? (followStatus === "Add" ? 1 : 0) : spaceFollowRecord.star;

            await prisma.spaceStar.update({
                where : {
                    id : spaceFollowRecord.id
                },
                data : {
                    like : likeType,
                    star : starType
                }
            });

        })
    }

    public deleteSpace(spaceId : number)
    {
        return PrismaManager.transaction(async (prisma) =>
        {
            await prisma.space.delete({
                where : {
                    id : spaceId
                }
            })

            return "delete finish"
        })
    }

    public async deleteSpaceComment(commentId : number)
    {
        return PrismaManager.transaction(async (prisma) =>
        {
            await prisma.spaceComment.delete({
                where : {
                    id : commentId
                }
            })

            return "delete finish"
        })
    }

    public async getTodaySpace()
    {
        let today = general.today();
        let sql = `
            select sp.*, ud."nickname", ud."avatarURL" from "Community"."Space" as sp
            left join "Community"."UserDetail" as ud on ud."userId" = sp."userId"
            where sp."publishTime" >= '${today}'
            order by sp."publishTime" desc
        `

        return await PrismaManager.execute(sql);
    
    }

    public async add_scan_number(spaceId : number)
    {
        return await PrismaManager.transaction(async (prisma) =>
        {
            let space = await prisma.space.findFirst({
                where : {
                    id : spaceId
                }
            });

            if(!space)
                throw new Error("space Not Found");

            await prisma.space.update({
                data : {
                    scanNumber : space.scanNumber + 1
                },
                where : {
                    id : spaceId
                }
            })
        })
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