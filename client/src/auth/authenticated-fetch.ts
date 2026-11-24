import { resumeSession } from "./auth-api";
import { storedTokens } from "./session";

const authorization = (): Record<string, string> => {
	const tokens = storedTokens();
	return tokens ? { Authorization: `Bearer ${tokens.accessToken}` } : {};
};

// A fetch that sends the logged-in player's access token, when there is a session. When the server refuses it as
// expired, refreshing stores the next one (or forgets the session when the server refuses that too) and the request is
// sent once more.
export const authenticatedFetch = async (
	url: string,
	init: RequestInit & { headers?: Record<string, string> } = {},
) => {
	const send = () => fetch(url, { ...init, headers: { ...init.headers, ...authorization() } });
	const response = await send();
	if (response.status !== 401) return response;
	await resumeSession();
	return send();
};
