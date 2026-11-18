import { Injectable } from "@nestjs/common";
import { RefreshTokenStore } from "../applicative/interfaces/refresh-token.store.js";
import type { RefreshToken } from "../domain/refresh-token.js";
import { hashRefreshToken, newRefreshToken } from "./refresh-token-hash.js";

type StoredRefreshToken = RefreshToken & { revoked: boolean };

// Keyed by token hash, like the refresh_token table.
@Injectable()
export class InMemoryRefreshTokenStore extends RefreshTokenStore {
	private readonly tokens = new Map<string, StoredRefreshToken>();

	async issue(refreshToken: RefreshToken) {
		const token = newRefreshToken();
		this.tokens.set(hashRefreshToken(token), { ...refreshToken, revoked: false });
		return token;
	}

	async consume(token: string, now: Date) {
		const stored = this.tokens.get(hashRefreshToken(token));
		if (!stored || stored.revoked || stored.expiresAt <= now) return undefined;
		stored.revoked = true;
		return stored.playerId;
	}
}
