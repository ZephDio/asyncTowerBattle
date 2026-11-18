import { Injectable } from "@nestjs/common";
import { IdProvider } from "../../shared/applicative/interfaces/id-provider.js";
import type { Player } from "../domain/player.js";
import { AccessTokens } from "./interfaces/access-tokens.js";
import { RefreshTokenStore } from "./interfaces/refresh-token.store.js";

// What a player gets when they log in, register or refresh: the client keeps both tokens.
export type Session = { player: Player; accessToken: string; refreshToken: string };

const REFRESH_TOKEN_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

// Shared by the session use cases.
@Injectable()
export class SessionOpener {
	constructor(
		private readonly accessTokens: AccessTokens,
		private readonly refreshTokens: RefreshTokenStore,
		private readonly ids: IdProvider,
	) {}

	async open(player: Player, now = new Date()): Promise<Session> {
		const [accessToken, refreshToken] = await Promise.all([
			this.accessTokens.issue(player.id),
			this.refreshTokens.issue({
				id: this.ids.next(),
				playerId: player.id,
				expiresAt: new Date(now.getTime() + REFRESH_TOKEN_LIFETIME_MS),
			}),
		]);
		return { player, accessToken, refreshToken };
	}
}
