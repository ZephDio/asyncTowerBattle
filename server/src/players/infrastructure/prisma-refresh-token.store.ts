import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service.js";
import { RefreshTokenStore } from "../applicative/interfaces/refresh-token.store.js";
import type { RefreshToken } from "../domain/refresh-token.js";
import { hashRefreshToken, newRefreshToken } from "./refresh-token-hash.js";

@Injectable()
export class PrismaRefreshTokenStore extends RefreshTokenStore {
	constructor(private readonly prisma: PrismaService) {
		super();
	}

	async issue({ id, playerId, expiresAt }: RefreshToken) {
		const token = newRefreshToken();
		await this.prisma.refreshToken.create({ data: { id, playerId, tokenHash: hashRefreshToken(token), expiresAt } });
		return token;
	}

	async consume(token: string, now: Date) {
		const tokenHash = hashRefreshToken(token);
		// A conditional update, so two requests racing with the same token can't both use it.
		const { count } = await this.prisma.refreshToken.updateMany({
			where: { tokenHash, revokedAt: null, expiresAt: { gt: now } },
			data: { revokedAt: now },
		});
		if (count === 0) return undefined;
		const row = await this.prisma.refreshToken.findUnique({ where: { tokenHash }, select: { playerId: true } });
		return row?.playerId;
	}
}
