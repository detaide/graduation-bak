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
        publishInfo.userId = parseInt(req.query.user_id as string);
        return this.spaceService.publish(publishInfo);
    }

    @Get('all_space')
    bringAllSpace(@Req() req : Request)
    {
        const type = req.query.type as string;
        return this.spaceService.bringAllSpace(+type);
    }

    @Get("space_info_by_user_id")
    bringAllSpaceByUserId(@Req() req : Request)
    {
        const userId = req.query.user_id as string;
        return this.spaceService.bringAllSpaceByUserId(+userId);
    }
    


    @Get('space_detail')
    async bringSpaceDetail(@Req() req : Request)
    {
        console.log(req.query.space_id)
        let ret = await this.spaceService.bringSpaceDetail(+req.query.space_id);
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
}
 