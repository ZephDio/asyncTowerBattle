import { authenticatedFetch } from "../../auth/authenticated-fetch";
import { loggedInPlayer } from "../../auth/session";
import { DEV_START } from "../../shared/dev-start";
import { SERVER_URL } from "../../shared/server-url";
import { SavedGame } from "./saved-game";

// Only a logged-in player has a game to continue, and games in dev mode (`?dev`) change nothing on the server, like
// their opponent requests. Guests and dev runs save nothing and have nothing to continue.
const saves = () => loggedInPlayer() !== undefined && !DEV_START;

const url = `${SERVER_URL}/current-game`;

// The saves go one after the other, so a slow request can't land after a newer one and bring back an older game.
let queue: Promise<unknown> = Promise.resolve();

const enqueue = <T>(task: () => Promise<T>): Promise<T> => {
	const result = queue.then(task, task);
	queue = result.catch(() => undefined);
	return result;
};

const ensureOk = (response: Response) => {
	if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
	return response;
};

// Replaces the player's saved game. A failure is only logged: the game goes on, and the next save tries again.
export const saveGame = (game: SavedGame): Promise<void> => {
	if (!saves()) return Promise.resolve();
	return enqueue(async () => {
		ensureOk(
			await authenticatedFetch(url, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(game),
			}),
		);
	}).catch((error) => console.warn("The game could not be saved", error));
};

// The game is over: there is nothing left to continue.
export const deleteSavedGame = (): Promise<void> => {
	if (!saves()) return Promise.resolve();
	return enqueue(async () => {
		ensureOk(await authenticatedFetch(url, { method: "DELETE" }));
	}).catch((error) => console.warn("The saved game could not be deleted", error));
};

// The game the player left running, or null when they have none. Throws when the server can't be reached or refuses:
// that is not the same as having no game, so the caller decides what to do about it.
export const loadSavedGame = async (): Promise<SavedGame | null> => {
	if (!saves()) return null;
	const response = await enqueue(async () => ensureOk(await authenticatedFetch(url)));
	const { game }: { game: SavedGame | null } = await response.json();
	return game;
};
