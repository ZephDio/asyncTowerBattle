import { assertBoardRules, RANDOM_SEED_RANGE } from "../../opponents/domain/board-rules.js";
import type { GamePerformance } from "../../opponents/domain/player-board.js";
import type { SerializedBoard, SerializedCell } from "../../opponents/domain/serialized-board.js";
import {
	InvalidGoldError,
	InvalidLifeError,
	InvalidRunSeedError,
	InvalidSavedPerformanceError,
	MissingOpponentError,
	OpponentRoundError,
	UnexpectedOpponentError,
} from "./current-game-errors.js";

// A piece of the reserve (the inventory), in the client's serialized form: the board's elements, plus the traps and the
// units that can wait there. Only the kind is checked here, like the board's piece types, so a new piece of a newer
// client needs no server change.
export type SavedItem = { kind: string; cell: SerializedCell; [field: string]: unknown };

// An offer the player reserved in the shop: the piece in its slot (the item's cell), and its price.
export type SavedOffer = { item: SavedItem; price: number };

export type SavedOpponent = { board: SerializedBoard; playerName: string };

export type SavedPhase = "shop" | "battle";

// What the client needs to reopen a game: the army as it was when the phase started, the reserve, the gold and the
// lives, and for a battle the opponent the player was matched with.
export type SavedGame = {
	phase: SavedPhase;
	// The seed of the run, which the client draws the shop offers, the environment and its board's battle seeds from. It
	// is a seed BattleRandomSeed takes.
	runSeed: number;
	life: number;
	gold: number;
	performance: GamePerformance;
	// The player's own board, of the round being played. Its random seed is not used.
	board: SerializedBoard;
	inventory: SavedItem[];
	// The shop offers the player reserved, for the next shop to keep. A game saved before reservations has none.
	reservedOffers?: SavedOffer[];
	opponent: SavedOpponent | null;
};

export type CurrentGameProps = { playerId: string; game: SavedGame };

const isCount = (value: number) => Number.isInteger(value) && value >= 0;

// The game a player left running, kept so they can continue it: one per player, replaced at the start of each shop and
// each battle. The constructor refuses a game breaking the rules, so every CurrentGame is valid.
export class CurrentGame {
	readonly playerId: string;
	readonly game: SavedGame;

	constructor({ playerId, game }: CurrentGameProps) {
		assertBoardRules(game.board);
		if (!Number.isInteger(game.runSeed) || game.runSeed < 0 || game.runSeed >= RANDOM_SEED_RANGE) {
			throw new InvalidRunSeedError(game.runSeed);
		}
		if (!Number.isInteger(game.life) || game.life < 1) throw new InvalidLifeError(game.life);
		if (!isCount(game.gold)) throw new InvalidGoldError(game.gold);
		if (!isCount(game.performance.wins) || !isCount(game.performance.losses)) {
			throw new InvalidSavedPerformanceError(game.performance);
		}
		CurrentGame.assertOpponent(game);
		this.playerId = playerId;
		this.game = game;
	}

	private static assertOpponent({ phase, board, opponent }: SavedGame) {
		if (phase === "shop" && opponent) throw new UnexpectedOpponentError();
		if (phase === "shop") return;
		if (!opponent) throw new MissingOpponentError();
		assertBoardRules(opponent.board);
		if (opponent.board.round !== board.round) throw new OpponentRoundError(board.round, opponent.board.round);
	}

	get round() {
		return this.game.board.round;
	}

	toProps(): CurrentGameProps {
		return { playerId: this.playerId, game: this.game };
	}
}
