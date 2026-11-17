import { InvalidRoundError } from "../../domain/opponent-errors.js";
import { NoOpponentError } from "../opponent-errors.js";
import type { SerializedBoard } from "../../domain/serialized-board.js";
import { InMemoryOpponentBoardStore } from "../../infrastructure/in-memory-opponent-board.store.js";
import { GetOpponent } from "./get-opponent.use-case.js";

const board = (round: number): SerializedBoard => ({
	round,
	faction: "Dwarf",
	size: { width: 8, height: 6 },
	randomSeed: round,
	elements: [{ kind: "castle", cell: { x: 0, y: 5 } }],
});

const getOpponent = (...boards: SerializedBoard[]) => new GetOpponent(InMemoryOpponentBoardStore.seeded(boards));

describe("GetOpponent", () => {
	it("gives a board of the round", () => {
		expect(getOpponent(board(1), board(2), board(3)).execute(2)).toEqual(board(2));
	});

	it("falls back to the latest earlier round", () => {
		const useCase = getOpponent(board(1), board(4));

		expect(useCase.execute(3)).toEqual(board(1));
		expect(useCase.execute(9)).toEqual(board(4));
	});

	it("has no opponent before the first stored round", () => {
		expect(() => getOpponent(board(2)).execute(1)).toThrow(NoOpponentError);
		expect(() => getOpponent().execute(1)).toThrow(NoOpponentError);
	});

	it.each([0, -1, 1.5])("refuses round %d", (round) => {
		expect(() => getOpponent(board(1)).execute(round)).toThrow(InvalidRoundError);
	});
});
