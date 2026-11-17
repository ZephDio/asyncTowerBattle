import { deserializeBoard } from "./board-serializer";
import { LocalMatchMaker } from "./local-match-maker";
import { MatchMaker, Opponent } from "./match-maker";
import { SerializedBoard } from "./serialized-board";

const DEFAULT_SERVER_URL = "http://localhost:6868";

// Asks the opponent server (asyncTowerBattleServer) for a board of the round. When the server can't be reached, the
// game still plays against the local boards.
export class RemoteMatchMaker extends MatchMaker {
	constructor(
		private serverUrl = DEFAULT_SERVER_URL,
		private fallback: MatchMaker = new LocalMatchMaker(),
	) {
		super();
	}

	async getOpponent(round: number): Promise<Opponent> {
		try {
			const response = await fetch(`${this.serverUrl}/opponents/${round}`);
			if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
			const board: SerializedBoard = await response.json();
			return deserializeBoard(board);
		} catch (error) {
			console.warn(`Opponent server unavailable, using a local board for round ${round}`, error);
			return this.fallback.getOpponent(round);
		}
	}
}
