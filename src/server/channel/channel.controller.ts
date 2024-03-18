import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ChannelItemCommentReq, ChannelItemReq, ChannelRes, ChannelService } from './channel.service';
import { Request } from 'express';

@Controller('channel')
export class ChannelController {
    constructor(private readonly channelService : ChannelService) {}

    @Post('create_channel')
    async createChannel(@Body() body : ChannelRes, @Req() req : Request)
    {
        let userId = parseInt(req.query.user_id as string);
        if(!userId)
            throw new Error("No User Id Provided");
        body.userId = userId;
        return await this.channelService.createChannel(body);
    }

    @Get('all_channel')
    async getAllChannel()
    {
        return await this.channelService.getAllChannel();
    }

    @Post('create_channel_item')
    async createChannelItem(@Req() req : Request, @Body() body : ChannelItemReq)
    {
        let userId = parseInt(req.query.user_id as string);
        if(!userId)
            throw new Error("No User Id Provided");
        body.userId = userId;
        return await this.channelService.createChannelItem(body);
    }

    @Get('bring_channel_item_info')
    async bringChannelItemInfo(@Req() req : Request)
    {
        let channelId = parseInt(req.query.channel_id as string);
        if(!channelId)
            throw new Error("No Channel Id Provided");
        return await this.channelService.bringChannelItemInfo(channelId);
    }

    @Post('create_channel_item_comment')
    async createChannelItemComment(@Req() req : Request, @Body() body : ChannelItemCommentReq)
    {
        let userId = parseInt(req.query.user_id as string);
        if(!userId)
            throw new Error("No User Id Provided");
        body.userId = userId;
        return await this.channelService.createChannelItemComment(body);
    }

    @Get('bring_channel_item_comment')
    async getChannelType()
    {
        return await this.channelService.getChannelType();
    }

    @Get('channel_follow')
    async channelFollow(@Req() req : Request)
    {
        let userId = parseInt(req.query.user_id as string);
        let channelId = parseInt(req.query.channel_id as string);
        if(!req.query.user_id)
            throw new Error("No User Id Provided");

        return await this.channelService.channelFollow(userId, channelId);
    }

    @Get('channel_follow_by_user_id')
    async getChannelFollowByUserId(@Req() req : Request)
    {
        let userId = parseInt(req.query.user_id as string);
        if(!req.query.user_id)
            throw new Error("No User Id Provided");

        return await this.channelService.getChannelFollowByUserId(userId);
    }
}
