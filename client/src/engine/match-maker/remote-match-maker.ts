import { authenticatedFetch } from "../../auth/authenticated-fetch";
import { DEV_START } from "../../shared/dev-start";
import { SERVER_URL } from "../../shared/server-url";
import { Army } from "../army/army";
import { deserializeBoard, serializeBoard } from "./board-serializer";
import { LocalMatchMaker } from "./local-match-maker";
import { BOT_NAME, GamePerformance, MatchMaker, Opponent } from "./match-maker";
import { SerializedBoard } from "./serialized-board";

// Trades the player's board with the opponent server (server/) for a board of the round. A logged-in player sends their
// access token: the server keeps the board as theirs for the next players, consumes the opponent, and never gives them
// one of theirs. A guest's or a dev mode request only reads, so playing as a guest or in dev mode changes nothing on
// the server. When the server can't be reached, the game still plays against the local boards.
export class RemoteMatchMaker extends MatchMaker {
	constructor(
		private serverUrl = SERVER_URL,
		private fallback: MatchMaker = new LocalMatchMaker(),
		// Test requests get an opponent without publishing the player's board or consuming the opponent's, even for a
		// logged-in player. Games in dev mode (`?dev`) send them.
		private test = DEV_START,
	) {
		super();
	}

	async getOpponent(round: number, army: Army, performance: GamePerformance, boardSeed: number): Promise<Opponent> {
		try {
			const board = serializeBoard(army, round, boardSeed);
			const response = await authenticatedFetch(
				`${this.serverUrl}/opponents/${round}${this.test ? "?test=true" : ""}`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ board, performance }),
				},
			);
			if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
			// A default board has no player, so no name.
			const { board: opponent, playerName }: { board: SerializedBoard; playerName?: string } = await response.json();
			return { ...deserializeBoard(opponent), playerName: playerName ?? BOT_NAME };
		} catch (error) {
			console.warn(`Opponent server unavailable, using a local board for round ${round}`, error);
			return this.fallback.getOpponent(round, army, performance, boardSeed);
		}
	}
}
