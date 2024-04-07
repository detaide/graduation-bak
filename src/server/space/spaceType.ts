export class SpaceType {
    public static spaceType = {
        100 : '最新动态',
        101 : "校园动态",
        102 : "心情",
        103 : "游戏",
        104 : '学习',
        105 : '影视',
        106 : '音乐',
        107 : "交友",
        108 : "校园市场"
    }

    public static getSpaceTypeName(type : number)
    {
        let spaceType = SpaceType.spaceType;
        for(let key in spaceType)
        {
            if(+key === type)
            {
                return spaceType[key];
            }
        }
        return '未知类型';
    }
}