import { Injectable } from "@nestjs/common";
import { RefreshTokenStore } from "../interfaces/refresh-token.store.js";

// Revokes the session's refresh token. Its access token stays valid until it expires, a few minutes later.
@Injectable()
export class Logout {
	constructor(private readonly refreshTokens: RefreshTokenStore) {}

	async execute({ refreshToken }: { refreshToken: string }): Promise<void> {
		await this.refreshTokens.consume(refreshToken, new Date());
	}
}
