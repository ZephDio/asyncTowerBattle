import { UuidProvider } from "../../../shared/infrastructure/uuid-provider.js";
import { InMemoryPlayerStore } from "../../infrastructure/in-memory-player.store.js";
import { InMemoryRefreshTokenStore } from "../../infrastructure/in-memory-refresh-token.store.js";
import { AccessTokens } from "../interfaces/access-tokens.js";
import { InvalidRefreshTokenError } from "../player-errors.js";
import { SessionOpener } from "../session-opener.js";
import { RefreshSession } from "./refresh-session.use-case.js";

class PlainAccessTokens extends AccessTokens {
	async issue(playerId: string) {
		return `access:${playerId}`;
	}

	async verify(token: string) {
		return token.replace(/^access:/, "");
	}
}

const DAY_MS = 24 * 60 * 60 * 1000;

const setup = async () => {
	const players = new InMemoryPlayerStore();
	const refreshTokens = new InMemoryRefreshTokenStore();
	const sessions = new SessionOpener(new PlainAccessTokens(), refreshTokens, new UuidProvider());
	const player = { id: "player-1", email: "1@example.com", name: "Zeph" };
	await players.create({ ...player, googleId: "1" });
	return { player, sessions, useCase: new RefreshSession(refreshTokens, players, sessions) };
};

describe("RefreshSession", () => {
	const now = new Date("2026-11-17T12:00:00Z");

	it("opens a new session for the token's player", async () => {
		const { player, sessions, useCase } = await setup();
		const { refreshToken } = await sessions.open(player, now);

		const session = await useCase.execute({ refreshToken }, new Date(now.getTime() + DAY_MS));

		expect(session.player).toEqual(player);
		expect(session.accessToken).toBe(`access:${player.id}`);
	});

	it("keeps a token valid for 30 days", async () => {
		const { player, sessions, useCase } = await setup();
		const { refreshToken } = await sessions.open(player, now);

		await expect(useCase.execute({ refreshToken }, new Date(now.getTime() + 30 * DAY_MS))).rejects.toThrow(
			InvalidRefreshTokenError,
		);
	});

	it("refuses an unknown token", async () => {
		const { useCase } = await setup();

		await expect(useCase.execute({ refreshToken: "unknown" }, now)).rejects.toThrow(InvalidRefreshTokenError);
	});
});
