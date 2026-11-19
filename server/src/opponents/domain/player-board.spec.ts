import { roundGridSize } from "./board-rules.js";
import {
	InvalidBoardSizeError,
	InvalidPerformanceError,
	InvalidRandomSeedError,
	InvalidRoundError,
} from "./opponent-errors.js";
import { PlayerBoard, type PlayerBoardProps } from "./player-board.js";
import type { SerializedBoard } from "./serialized-board.js";

const board = (round: number, overrides: Partial<SerializedBoard> = {}): SerializedBoard => ({
	round,
	faction: "Elf",
	size: roundGridSize(round),
	randomSeed: 7,
	elements: [{ kind: "castle", cell: { x: 0, y: 5 } }],
	...overrides,
});

const props = (overrides: Partial<PlayerBoardProps> = {}): PlayerBoardProps => ({
	id: "board-1",
	board: board(2),
	performance: { wins: 1, losses: 0 },
	playerId: "alice",
	...overrides,
});

describe("PlayerBoard", () => {
	it("keeps a valid board, with no puller yet", () => {
		const playerBoard = new PlayerBoard(props());

		expect(playerBoard.round).toBe(2);
		expect(playerBoard.pulledBy).toEqual([]);
		expect(playerBoard.toProps()).toEqual({ ...props(), pulledBy: [] });
	});

	it.each([0, -1, 1.5])("refuses round %d", (round) => {
		expect(() => new PlayerBoard(props({ board: board(round, { size: roundGridSize(1) }) }))).toThrow(
			InvalidRoundError,
		);
	});

	it("refuses a grid that isn't the size of its round", () => {
		expect(() => new PlayerBoard(props({ board: board(4, { size: roundGridSize(2) }) }))).toThrow(
			InvalidBoardSizeError,
		);
	});

	it.each([-1, 1.5, 2 ** 31])("refuses random seed %d", (randomSeed) => {
		expect(() => new PlayerBoard(props({ board: board(2, { randomSeed }) }))).toThrow(InvalidRandomSeedError);
	});

	it("takes the bounds of the random seed range", () => {
		expect(new PlayerBoard(props({ board: board(2, { randomSeed: 0 }) })).board.randomSeed).toBe(0);
		expect(new PlayerBoard(props({ board: board(2, { randomSeed: 2 ** 31 - 1 }) })).board.randomSeed).toBe(2 ** 31 - 1);
	});

	it.each([
		{ wins: -1, losses: 0 },
		{ wins: 0, losses: 0.5 },
	])("refuses performance %o", (performance) => {
		expect(() => new PlayerBoard(props({ performance }))).toThrow(InvalidPerformanceError);
	});

	it("records a puller on a new board, leaving the first one as it was", () => {
		const playerBoard = new PlayerBoard(props());

		const pulled = playerBoard.pulledByBoard("puller-1").pulledByBoard("puller-2");

		expect(pulled.pulledBy).toEqual(["puller-1", "puller-2"]);
		expect(pulled.id).toBe(playerBoard.id);
		expect(playerBoard.pulledBy).toEqual([]);
	});
});
