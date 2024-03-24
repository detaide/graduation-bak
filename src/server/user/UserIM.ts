import { post } from "@/utils/request";
import {Api} from "./generateTestUserSig";
import dotenv from "dotenv";

export class UserIM
{
    private env = dotenv.config().parsed;

    public static readonly SDKSite = {
        China : "console.tim.qq.com",
        Singapore : "adminapisgp.im.qcloud.com"
    }

    private static readonly EXPIRETIME = 604800;

    public static readonly remoteAPI = {
        accountMulti : "v4/im_open_login_svc/multiaccount_import",
        accountSingle : 'v4/im_open_login_svc/account_import'
    }

    public async createIMRecord(nickName : string, userId : number)
    {
        console.log(this.env);
        let userSig = new Api(parseInt(this.env.TIM_sdkAppId), this.env.TIM_SecretKey).genUserSig('admin', UserIM.EXPIRETIME);
        let userData = {
            UserID : userId.toString(),
            Nick : nickName,
            FaceUrl : "https://img.zcool.cn/community/01cc8a5cd8d050a801214168350cd3.jpg@2o.jpg"
        }

        let ramdomNumber = Math.floor(Math.random() * 100000000);

        let im_create_url = `https://${UserIM.SDKSite.China}/${UserIM.remoteAPI.accountSingle}?sdkappid=${this.env.TIM_sdkAppId}&identifier=admin&usersig=${userSig}&random=${ramdomNumber}&contenttype=json`;
        
        console.log(im_create_url)
        
        // let ret = await post({
        //     url : im_create_url,
        //     data : userData
        // })

        // if(ret.data.ActionStatus === 'OK')
        // {
        //     return "Create IM Record Successfully";
        // }

        
    }

}