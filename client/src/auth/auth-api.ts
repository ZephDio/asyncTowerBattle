import { SERVER_URL } from "../shared/server-url";
import { forgetSession, type Session, storedTokens, storeSession } from "./session";

// A refusal from the server, with its HTTP status: 400 for an invalid name, email or password, 401 for an invalid
// credential, token or password, 404 for a Google account with no player, 409 for a Google account that already has a
// player or a taken email or name.
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
	storeSession(session);
	return session;
};

// `credential` is the ID token the Google sign-in button gives.
export const loginWithGoogle = (credential: string) => openSession("/auth/google/login", { credential });

export const registerWithGoogle = (credential: string, name: string) =>
	openSession("/auth/google/register", { credential, name });

// `identifier` is the player's email or player name.
export const loginWithPassword = (identifier: string, password: string) =>
	openSession("/auth/password/login", { identifier, password });

export const registerWithPassword = (email: string, name: string, password: string) =>
	openSession("/auth/password/register", { email, name, password });

// Reopens the stored session, or gives undefined when there is none or the server refused it. Throws when the server
// can't be reached, keeping the tokens for the next try.
export const resumeSession = async (): Promise<Session | undefined> => {
	const tokens = storedTokens();
	if (!tokens) return undefined;
	try {
		return await openSession("/auth/refresh", { refreshToken: tokens.refreshToken });
	} catch (error) {
		if (!(error instanceof AuthError)) throw error;
		forgetSession();
		return undefined;
	}
};

export const logout = async () => {
	const tokens = storedTokens();
	forgetSession();
	if (tokens) await post("/auth/logout", { refreshToken: tokens.refreshToken }).catch(() => undefined);
};
