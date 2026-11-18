import { Injectable } from "@nestjs/common";
import { PlayerStore } from "../interfaces/player.store.js";
import { RefreshTokenStore } from "../interfaces/refresh-token.store.js";
import { InvalidRefreshTokenError } from "../player-errors.js";
import { type Session, SessionOpener } from "../session-opener.js";

// Trades a refresh token for a new access token and the next refresh token: each refresh token is used once.
@Injectable()
export class RefreshSession {
	constructor(
		private readonly refreshTokens: RefreshTokenStore,
		private readonly players: PlayerStore,
		private readonly sessions: SessionOpener,
	) {}

	async execute({ refreshToken }: { refreshToken: string }, now = new Date()): Promise<Session> {
		const playerId = await this.refreshTokens.consume(refreshToken, now);
		const player = playerId && (await this.players.findById(playerId));
		if (!player) throw new InvalidRefreshTokenError();
		return this.sessions.open(player, now);
	}
}
