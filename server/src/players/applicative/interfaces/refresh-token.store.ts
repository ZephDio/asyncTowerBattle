import type { RefreshToken } from "../../domain/refresh-token.js";

// Output port of the session use cases: the refresh tokens of the open sessions. Each one is used once.
export abstract class RefreshTokenStore {
	// Stores the refresh token and gives its secret, the token the client sends back.
	abstract issue(refreshToken: RefreshToken): Promise<string>;
	// Revokes the token and gives its player, or undefined when it is unknown, expired or already revoked.
	abstract consume(token: string, now: Date): Promise<string | undefined>;
}
