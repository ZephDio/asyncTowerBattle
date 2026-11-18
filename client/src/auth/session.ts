// Keep in sync with server/src/players/domain/player.ts and applicative/session-opener.ts.
export type Player = { id: string; email: string; name: string };

export type SessionTokens = { accessToken: string; refreshToken: string };

export type Session = SessionTokens & { player: Player };

const STORAGE_KEY = "atb.session";

// The tokens of the logged-in player, kept across reloads. Reads and writes never throw: without storage, such as in
// a private window that blocks it, the player just logs in again next time.
export const storedTokens = (): SessionTokens | undefined => {
	try {
		const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
		return typeof stored?.accessToken === "string" && typeof stored?.refreshToken === "string" ? stored : undefined;
	} catch {
		return undefined;
	}
};

export const storeTokens = ({ accessToken, refreshToken }: SessionTokens) => {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken, refreshToken }));
	} catch {}
};

export const forgetTokens = () => {
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch {}
};
