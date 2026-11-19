import { assertBoardRules } from "./board-rules.js";
import { InvalidPerformanceError } from "./opponent-errors.js";
import type { SerializedBoard } from "./serialized-board.js";

// How the player did so far in their game. Not used yet, kept for matchmaking.
export type GamePerformance = { wins: number; losses: number };

export type PlayerBoardProps = {
	id: string;
	board: SerializedBoard;
	performance: GamePerformance;
	playerId?: string | undefined;
	pulledBy?: readonly string[];
};

const assertPerformance = (performance: GamePerformance) => {
	if (![performance.wins, performance.losses].every((count) => Number.isInteger(count) && count >= 0)) {
		throw new InvalidPerformanceError(performance);
	}
};

// A board a player sent when asking for an opponent, as it was at the end of their build phase. `playerId` is the
// logged-in player who sent it. `pulledBy` lists the boards whose players pulled it as their opponent, oldest first.
// The constructor refuses a board breaking the board rules or a performance that isn't counts, so every PlayerBoard is
// valid, and it never changes: recording a puller makes a new one.
export class PlayerBoard {
	readonly id: string;
	readonly board: SerializedBoard;
	readonly performance: GamePerformance;
	readonly playerId: string | undefined;
	readonly pulledBy: readonly string[];

	constructor({ id, board, performance, playerId, pulledBy = [] }: PlayerBoardProps) {
		assertBoardRules(board);
		assertPerformance(performance);
		this.id = id;
		this.board = board;
		this.performance = performance;
		this.playerId = playerId;
		this.pulledBy = pulledBy;
	}

	get round() {
		return this.board.round;
	}

	// The same board, also pulled by the board `boardId`.
	pulledByBoard(boardId: string) {
		return new PlayerBoard({ ...this.toProps(), pulledBy: [...this.pulledBy, boardId] });
	}

	toProps(): PlayerBoardProps {
		return {
			id: this.id,
			board: this.board,
			performance: this.performance,
			playerId: this.playerId,
			pulledBy: this.pulledBy,
		};
	}
}
