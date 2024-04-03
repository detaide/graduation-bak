import { Body, Controller, Get, Header, Param, Post, Req } from '@nestjs/common';
import { PublishCommentType, PublishInfoType, SpaceService } from './space.service';
import { Request, Response, NextFunction } from 'express';

@Controller('space')
export class SpaceController {
    constructor(private readonly spaceService: SpaceService) {}

    @Post('publish')
    @Header("Access-Control-Allow-Credentials", "true")
    
    publish(@Body() publishInfo : PublishInfoType, @Req() req : Request)
    {
        // console.log(publishInfo);
        let userId = parseInt(req.query.user_id as string);
        if(!userId)
        {
            throw new Error("user_id is empty");
        }
        publishInfo.userId = userId;
        return this.spaceService.publish(publishInfo);
    }

    @Get('all_space')
    bringAllSpace(@Req() req : Request)
    {
        const type = req.query.type as string;
        console.log("type",type);
        return this.spaceService.bringAllSpace(+type);
    }

    @Get("space_info_by_user_id")
    bringAllSpaceByUserId(@Req() req : Request)
    {
        const userId = req.query.user_id as string;
        return this.spaceService.bringAllSpace(null, +userId);
    }
    

    @Get('space_by_follow')
    bringSpaceByFollow(@Req() req : Request)
    {
        const userId = req.query.user_id as string;
        if(!userId)
        {
            throw new Error("user_id is empty");
        }
        return this.spaceService.bringSpaceByFollow(+userId);
    }


    @Get('space_detail')
    async bringSpaceDetail(@Req() req : Request)
    {
        let spaceId = req.query.space_id;
        if(!spaceId)
        {
            throw new Error("user_id is empty");
        }
        let ret = await this.spaceService.bringSpaceDetail(+spaceId);
        return {
            article : ret
        }
    }

    @Post('publish_comment')
    async pubishComment(@Req() req : Request, @Body() body : PublishCommentType)
    {
        body.userId = parseInt(req.query.user_id as string);
        return this.spaceService.publishComment(body);
    }

    @Get('space_comment')
    async bringSpaceCommentBySpaceId(@Req() req : Request)
    {
        let spaceId = +req.query.space_id;
        return this.spaceService.bringSpaceCommentBySpaceId(spaceId);
    }

    @Get('space_by_user_id')
    async bringSpaceByUserId(@Req() req : Request)
    {
        let userId = +req.query.user_id;
        return this.spaceService.bringSpaceByUserId(userId);
    }

    @Post('add_thumbs')
    async addThumbsbyId(@Req() req : Request, @Body() body : {spaceId : number})
    {
        let spaceId = +body.spaceId;
        return this.spaceService.addThumbsbyId(spaceId);
    }

    @Get('space_type')
    async getSpaceType()
    {
        return this.spaceService.getSpaceType();
    }

    @Get('search_space')
    async SpaceSearch(@Req() req : Request)
    {
        let keyword = req.query.keyword as string;
        if(!keyword)
        {
            throw new Error("keyword is empty");
        }
        return this.spaceService.SpaceSearch(keyword);
    }

    @Get('space_general')
    async getSpaceGeneral(@Req() req : Request)
    {
        let spaceId = +req.query.space_id;
        let userId = +req.query.user_id;
        if(!spaceId || !userId)
            throw new Error("No Space Id or User Id Provided");
        console.log(userId, spaceId)
        return await this.spaceService.getSpaceGeneral(spaceId, userId);
    }

    @Post('space_follow')
    async spaceFollow(@Req() req : Request, @Body() body : {spaceId : number, userId : number, type : "Star" | "Like", followStatus : "Add" | "Cancel"})
    {
        console.log(body)
        let userId = +req.query.user_id;
        if(!body.followStatus || !body.spaceId || !body.type)
        {
            throw new Error("No Space Id or Follow Type Provided");
        
        }
        if(!userId)
            throw new Error("No User Id Provided");
        return this.spaceService.spaceFollow(userId, +body.spaceId, body.type, body.followStatus);
    }

    @Post("delete_space")
    async deleteSpace(@Req() req : Request, @Body() body : {spaceId : number})
    {
        let userId = +req.query.user_id;
        let spaceId = +body.spaceId;
        if(!userId || !spaceId)
        {
            throw new Error("No Space Id Or UserId Provided");
        }

        return this.spaceService.deleteSpace(spaceId);
    }
}
 