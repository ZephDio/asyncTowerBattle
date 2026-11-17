import { DEBUG_BRIDGE } from "../../debug/debug-flag";
import { Army } from "../army/army";
import { deserializeBoard, serializeBoard } from "./board-serializer";
import { LocalMatchMaker } from "./local-match-maker";
import { GamePerformance, MatchMaker, Opponent } from "./match-maker";
import { SerializedBoard } from "./serialized-board";

const DEFAULT_SERVER_URL = "http://localhost:6868";
// BattleRandomSeed works modulo 2**31.
const RANDOM_SEED_RANGE = 0x80000000;

// Trades the player's board with the opponent server (asyncTowerBattleServer) for a board of the round: the server
// keeps the player's board for the next players. When the server can't be reached, the game still plays against the
// local boards.
export class RemoteMatchMaker extends MatchMaker {
	constructor(
		private serverUrl = DEFAULT_SERVER_URL,
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
			const response = await fetch(`${this.serverUrl}/opponents/${round}${this.test ? "?test=true" : ""}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ board, performance }),
			});
			if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
			const opponent: SerializedBoard = await response.json();
			return deserializeBoard(opponent);
		} catch (error) {
			console.warn(`Opponent server unavailable, using a local board for round ${round}`, error);
			return this.fallback.getOpponent(round, army, performance);
		}
	}
}
