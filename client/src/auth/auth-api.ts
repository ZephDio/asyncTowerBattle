import { SERVER_URL } from "../shared/server-url";
import { forgetTokens, type Session, storedTokens, storeTokens } from "./session";

// A refusal from the server, with its HTTP status: 401 for an invalid credential or token, 404 for a Google account
// with no player, 409 for one that already has a player.
export class AuthError extends Error {
	constructor(
		readonly status: number,
		message: string,
	) {
		super(message);
	}
}

const post = async (path: string, body: object): Promise<Response> => {
	const response = await fetch(`${SERVER_URL}${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	if (!response.ok) {
		const { message } = await response.json().catch(() => ({ message: response.statusText }));
		throw new AuthError(response.status, Array.isArray(message) ? message.join(", ") : String(message));
	}
	return response;
};

const openSession = async (path: string, body: object): Promise<Session> => {
	const session: Session = await (await post(path, body)).json();
	storeTokens(session);
	return session;
};

// `credential` is the ID token the Google sign-in button gives.
export const loginWithGoogle = (credential: string) => openSession("/auth/google/login", { credential });

export const registerWithGoogle = (credential: string, name: string) =>
	openSession("/auth/google/register", { credential, name });

// Reopens the stored session, or gives undefined when there is none or the server refused it. Throws when the server
// can't be reached, keeping the tokens for the next try.
export const resumeSession = async (): Promise<Session | undefined> => {
	const tokens = storedTokens();
	if (!tokens) return undefined;
	try {
		return await openSession("/auth/refresh", { refreshToken: tokens.refreshToken });
	} catch (error) {
		if (!(error instanceof AuthError)) throw error;
		forgetTokens();
		return undefined;
	}
};

export const logout = async () => {
	const tokens = storedTokens();
	forgetTokens();
	if (tokens) await post("/auth/logout", { refreshToken: tokens.refreshToken }).catch(() => undefined);
};
