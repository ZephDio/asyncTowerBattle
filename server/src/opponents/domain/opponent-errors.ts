import type { GamePerformance } from "./player-board.js";

export class InvalidRoundError extends Error {
	constructor(round: number) {
		super(`Rounds start at 1, got ${round}`);
	}
}

export class InvalidPerformanceError extends Error {
	constructor(performance: GamePerformance) {
		super(`Wins and losses are counts, got ${JSON.stringify(performance)}`);
	}
}
