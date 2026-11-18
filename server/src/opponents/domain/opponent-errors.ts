import type { GridSize } from "./checked-board.js";
import type { GamePerformance } from "./player-board.js";

export class InvalidRoundError extends Error {
	constructor(round: number) {
		super(`Rounds start at 1, got ${round}`);
	}
}

export class InvalidBoardSizeError extends Error {
	constructor(round: number, expected: GridSize, size: GridSize | undefined) {
		super(
			`A board of round ${round} is ${expected.width}x${expected.height}, got ${size ? `${size.width}x${size.height}` : "no size"}`,
		);
	}
}

export class InvalidRandomSeedError extends Error {
	constructor(randomSeed: number) {
		super(`A random seed is an integer from 0 to 2**31 - 1, got ${randomSeed}`);
	}
}

export class InvalidPerformanceError extends Error {
	constructor(performance: GamePerformance) {
		super(`Wins and losses are counts, got ${JSON.stringify(performance)}`);
	}
}
