import { randomUUID } from "crypto";

export function uuidGenerate()
{
    return randomUUID();
}

export function generateId()
{
    const timestamp = Math.floor(new Date().getTime() / 100000); // 获取当前时间戳
    const randomSeed = Math.floor(Math.random() * 1000).toString().padStart(4, '0'); // 生成随机种子
    const uniqueString = `${timestamp}${randomSeed}`;
    return (+uniqueString * 10);


}