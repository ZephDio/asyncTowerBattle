import type { GridSize } from "./board-rules.js";
import type { GamePerformance } from "./player-board.js";

// A rule a PlayerBoard breaks, so no PlayerBoard is made.
export abstract class PlayerBoardRuleError extends Error {}

export class InvalidRoundError extends PlayerBoardRuleError {
	constructor(round: number) {
		super(`Rounds start at 1, got ${round}`);
	}
}

export class InvalidBoardSizeError extends PlayerBoardRuleError {
	constructor(round: number, expected: GridSize, size: GridSize) {
		super(`A board of round ${round} is ${expected.width}x${expected.height}, got ${size.width}x${size.height}`);
	}
}

export class InvalidRandomSeedError extends PlayerBoardRuleError {
	constructor(randomSeed: number) {
		super(`A random seed is an integer from 0 to 2**31 - 1, got ${randomSeed}`);
	}
}

export class InvalidPerformanceError extends PlayerBoardRuleError {
	constructor(performance: GamePerformance) {
		super(`Wins and losses are counts, got ${JSON.stringify(performance)}`);
	}
}
