export * from "./uuid"

export function time()
{
    return ~~(new Date().getTime() / 1000)
}

export function today()
{
    return new Date(new Date().toLocaleDateString()).getTime() / 1000
}
