import bcrypt from "bcrypt";

export function encodeString(value: string) {
  return Buffer.from(value).toString("base64");
}

export function decodeString(value: string) {
  return Buffer.from(value, "base64").toString("utf-8");
}

export async function hashString(value: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(value, saltRounds);
}

export async function verifyHashString(
  value: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(value, hash);
}
