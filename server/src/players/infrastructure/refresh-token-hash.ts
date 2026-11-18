import { createHash, randomBytes } from "node:crypto";

// A refresh token is 32 random bytes. The stores keep only its hash, so a leaked table opens no session.
export const newRefreshToken = () => randomBytes(32).toString("base64url");

export const hashRefreshToken = (token: string) => createHash("sha256").update(token).digest("hex");
