export * from "./uuid"

export function time()
{
    return ~~(new Date().getTime() / 1000)
}