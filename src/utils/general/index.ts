export * from "./uuid"
import {encrypted} from "../crypto/index"

export function time()
{
    return ~~(new Date().getTime() / 1000)
}

export function today()
{
    return new Date(new Date().toLocaleDateString()).getTime() / 1000
}

export function randomString(length : number)
{
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
export function randomPassword()
{
    let ramdomPassText = randomString(12);
    return encrypted(ramdomPassText);

}