import type { SerializedBoard } from "../domain/serialized-board.js";
import { InMemoryOpponentBoardStore } from "./in-memory-opponent-board.store.js";

const board = (round: number, randomSeed = round): SerializedBoard => ({
	round,
	faction: "Dwarf",
	size: { width: 8, height: 6 },
	randomSeed,
	elements: [{ kind: "castle", cell: { x: 0, y: 5 } }],
});

describe("InMemoryOpponentBoardStore", () => {
	it("groups the boards by round", () => {
		const store = InMemoryOpponentBoardStore.seeded([board(1), board(3, 30), board(3, 31)]);

		expect(store.rounds()).toEqual([1, 3]);
		expect(store.findByRound(3)).toEqual([board(3, 30), board(3, 31)]);
		expect(store.findByRound(2)).toEqual([]);
	});

	it("hands out copies of the stored boards", () => {
		const stored = board(1);
		const store = InMemoryOpponentBoardStore.seeded([stored]);
		stored.randomSeed = 42;
		store.findByRound(1)[0]!.elements.pop();

		expect(store.findByRound(1)).toEqual([board(1)]);
	});
});
