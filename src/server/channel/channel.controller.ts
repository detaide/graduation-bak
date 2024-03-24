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
        let keywords = req.query.keywords as string;
        if(!channelId)
            throw new Error("No Channel Id Provided");
        return await this.channelService.bringChannelItemInfo(channelId, keywords);
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

    @Get('bring_channel_detail_by_name')
    async bringChannelDetailByName(@Req() req : Request){
        let channelName = req.query.channel_name as string;
        let userId = parseInt(req.query.user_id as string);
        if(!req.query.channel_name)
            throw new Error("No Channel Name Provided");

        
        return await this.channelService.bringChannelDetailByName(channelName, userId);
    }

    @Get('bring_channel_item_detail')
    async bringChannelItemDetailAPI(@Req() req : Request){
        let channelItemId = parseInt(req.query.channel_item_id as string);
        if(!req.query.channel_item_id)
            throw new Error("No Channel Item Id Provided");

        
        return await this.channelService.bringChannelItemDetail(channelItemId);
    }

    @Get('add_channel_scan_number')
    async addChannelScanNumberAPI(@Req() req : Request){
        let channel_id = parseInt(req.query.channel_id as string);
        console.log(req.query.channel_id)
        if(!req.query.channel_id)
            throw new Error("No Channel Item Id Provided");

        
        return await this.channelService.addChannelScanNumber(channel_id);
    }

    @Get('bring_channel_item_by_user_id')
    async bringChannelItemByUserId(@Req() req : Request)
    {
        let userId = parseInt(req.query.user_id as string);
        if(!req.query.user_id)
            throw new Error("No User Id Provided");

        return await this.channelService.bringChannelItemByUserId(userId);
    }

    @Get('bring_all_channel_item')
    async bringAllChannelItemAPI(@Req() req : Request)
    {
        return await this.channelService.bringAllChannelItem();
    }

    @Get("bring_all_channel")
    async bringAllChannel(@Req() req : Request)
    {
        return await this.channelService.bringAllChannel();
    }

    @Post('follow_channel')
    async followChannel(@Req() req : Request, @Body() body : {channelId : number, type : number})
    {
        let userId = parseInt(req.query.user_id as string);
        if(!req.query.user_id)
            throw new Error("No User Id Provided");

        if(!body.channelId)
            throw new Error("No Channel Id Provided");

        return await this.channelService.followChannel(userId, body.channelId, body?.type);
    }

    @Get('search_channel')
    async channelSearch(@Req() req : Request)
    {
        let keyword = req.query.keyword as string;
        if(!keyword)
            throw new Error("keyword is empty");
        return await this.channelService.channelSearch(keyword);
    }

}
