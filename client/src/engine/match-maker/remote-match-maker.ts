import { resumeSession } from "../../auth/auth-api";
import { storedTokens } from "../../auth/session";
import { DEBUG_BRIDGE } from "../../debug/debug-flag";
import { SERVER_URL } from "../../shared/server-url";
import { Army } from "../army/army";
import { deserializeBoard, serializeBoard } from "./board-serializer";
import { LocalMatchMaker } from "./local-match-maker";
import { GamePerformance, MatchMaker, Opponent } from "./match-maker";
import { SerializedBoard } from "./serialized-board";

// BattleRandomSeed works modulo 2**31.
const RANDOM_SEED_RANGE = 0x80000000;

const authorization = (): Record<string, string> => {
	const tokens = storedTokens();
	return tokens ? { Authorization: `Bearer ${tokens.accessToken}` } : {};
};

// Trades the player's board with the opponent server (server/) for a board of the round: the server
// keeps the player's board for the next players. A logged-in player sends their access token, so the server stores the
// board as theirs and never gives them one of theirs. When the server can't be reached, the game still plays against
// the local boards.
export class RemoteMatchMaker extends MatchMaker {
	constructor(
		private serverUrl = SERVER_URL,
		private fallback: MatchMaker = new LocalMatchMaker(),
		// Test requests get an opponent without publishing the player's board or consuming the opponent's. Debug runs,
		// such as the headless game tools, send them.
		private test = DEBUG_BRIDGE,
	) {
		super();
	}

	async getOpponent(round: number, army: Army, performance: GamePerformance): Promise<Opponent> {
		try {
			// The seed of the battles other players will fight against this board.
			const board = serializeBoard(army, round, Math.floor(Math.random() * RANDOM_SEED_RANGE));
			const post = () =>
				fetch(`${this.serverUrl}/opponents/${round}${this.test ? "?test=true" : ""}`, {
					method: "POST",
					headers: { "Content-Type": "application/json", ...authorization() },
					body: JSON.stringify({ board, performance }),
				});
			let response = await post();
			// The access token expired: refreshing stores the next one, or forgets the session when the server refuses it.
			if (response.status === 401) {
				await resumeSession();
				response = await post();
			}
			if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
			const opponent: SerializedBoard = await response.json();
			return deserializeBoard(opponent);
		} catch (error) {
			console.warn(`Opponent server unavailable, using a local board for round ${round}`, error);
			return this.fallback.getOpponent(round, army, performance);
		}
	}
}
