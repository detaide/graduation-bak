import crypto from "crypto";

const Expire_Time = 4 * 60 * 60 * 1000;
const secretKey = 'ptu_cs_graduation';

const algorithm = 'aes-256-cbc'; // 使用 AES-256-CBC 加密算法
// const key = crypto.randomBytes(32); // 生成一个随机的 32 字节密钥
// const iv = crypto.randomBytes(16); // 生成一个随机的 16 字节初始化向量
const key = Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
const iv = Buffer.from('0123456789abcdef0123456789abcdef', 'hex');

export function generateCookie(id: number): string {
    let data = JSON.stringify({
        id,
        expireTime : new Date().getTime() + Expire_Time
    })
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

export function decryptEncryptedCookie(encryptedData: string): string {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

export function cookieExipred(cookie: string, id : number): boolean {
    console.log(cookie, id);
    let cookieInfo = JSON.parse(decryptEncryptedCookie(cookie));
    
    return (cookieInfo.expireTime < new Date().getTime()) && (cookieInfo.id !== id);
}
