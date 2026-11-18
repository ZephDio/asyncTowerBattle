// Keep in sync with server/src/players/domain/player.ts and applicative/session-opener.ts.
export type Player = { id: string; email: string; name: string };

export type SessionTokens = { accessToken: string; refreshToken: string };

export type Session = SessionTokens & { player: Player };

const STORAGE_KEY = "atb.session";

// The player of the open session, which the game shows in battle. Only the tokens are stored: resuming the session
// gives the player again.
let sessionPlayer: Player | undefined;

export const loggedInPlayer = () => sessionPlayer;

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

export const storeSession = ({ accessToken, refreshToken, player }: Session) => {
	sessionPlayer = player;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken, refreshToken }));
	} catch {}
};

export const forgetSession = () => {
	sessionPlayer = undefined;
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch {}
};
