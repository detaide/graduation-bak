export class ChannelType {
    public static channelType = {
        game : {
            name : "游戏",
            101 : "单机游戏",
            102 : "MMORPG",
            103 : "MOBA",
            104 : "射击游戏",
            105 : "策略游戏",
            106 : "体育游戏",
            107 : "模拟游戏",
            108 : "冒险游戏",
            109 : "其他"
        },
        music : {
            name : "音乐",
            201 : "流行音乐",
            202 : "摇滚音乐",
            203 : "古典音乐",
            204 : "电子音乐",
            205 : "其他"
        },
        film : {
            name : "电影",
            301 : "动作",
            302 : "科幻",
            303 : "爱情",
            304 : "喜剧",
            305 : "恐怖",
            306 : "战争",
            307 : "其他"
        },
        story : {
            name : "小说",
            401 : '奇幻',
            402 : '玄幻',
            403 : '武侠',
            404 : '仙侠',
            405 : '都市',
            406 : '历史',
            407 : '军事',
            408 : '游戏',
            409 : '体育',
            410 : '科幻',
        }
    }

    public static getChannelName(type : number)
    {
        let channelType = ChannelType.channelType;
        for(let key in channelType)
        {
            let typeObj = channelType[key];
            for(let typeKey in typeObj)
            {
                if(+typeKey === type)
                {
                    return typeObj[typeKey];
                }
            }
        }
    }
}