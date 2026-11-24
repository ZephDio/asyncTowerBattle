import { storedTokens } from "../auth/session";
import { SERVER_URL } from "../shared/server-url";
import type { FirstTimeSteps } from "./first-time-steps";

// The steps the server keeps with the logged-in player's account, `/players/me/steps`.
export const playerSteps = (): FirstTimeSteps => {
	const request = async (path: string, method: "GET" | "POST") => {
		const tokens = storedTokens();
		const response = await fetch(`${SERVER_URL}/players/me/steps${path}`, {
			method,
			headers: tokens ? { Authorization: `Bearer ${tokens.accessToken}` } : {},
		});
		if (!response.ok) throw new Error(`Steps request failed: ${response.status}`);
		return response;
	};
	return {
		async tutorialSeen() {
			return (await (await request("", "GET")).json()).tutorialSeen === true;
		},
		async markTutorialSeen() {
			await request("/tutorial-seen", "POST");
		},
	};
};
