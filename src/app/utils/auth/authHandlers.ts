export function encodeString(value:string) {
    return Buffer.from(value).toString('base64');
}

export function decodeString(value:string) {
    return Buffer.from(value, 'base64').toString('utf-8');
}