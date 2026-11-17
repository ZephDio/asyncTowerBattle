import type { PlayerBoard } from "../domain/player-board.js";
import { InMemoryOpponentBoardStore } from "./in-memory-opponent-board.store.js";

const playerBoard = (round: number, randomSeed = round): PlayerBoard => ({
	board: {
		round,
		faction: "Dwarf",
		size: { width: 8, height: 6 },
		randomSeed,
		elements: [{ kind: "castle", cell: { x: 0, y: 5 } }],
	},
	performance: { wins: 1, losses: 0 },
});

const withoutId = ({ board, performance }: PlayerBoard) => ({ board, performance });

describe("InMemoryOpponentBoardStore", () => {
	it("groups the boards by round", async () => {
		const store = InMemoryOpponentBoardStore.seeded([playerBoard(1), playerBoard(3, 30), playerBoard(3, 31)]);

		expect(await store.rounds()).toEqual([1, 3]);
		expect((await store.findByRound(3)).map(withoutId)).toEqual([playerBoard(3, 30), playerBoard(3, 31)]);
		expect(await store.findByRound(2)).toEqual([]);
	});

	it("removes a board by id, and its round once empty", async () => {
		const store = InMemoryOpponentBoardStore.seeded([playerBoard(1), playerBoard(3, 30), playerBoard(3, 31)]);
		const [first, second] = await store.findByRound(3);

		await store.remove(first!.id);
		expect(await store.findByRound(3)).toEqual([second]);

		await store.remove(second!.id);
		expect(await store.rounds()).toEqual([1]);
	});

	it("hands out copies of the stored boards", async () => {
		const stored = playerBoard(1);
		const store = InMemoryOpponentBoardStore.seeded([stored]);
		stored.board.randomSeed = 42;
		stored.performance.wins = 5;
		(await store.findByRound(1))[0]!.board.elements.pop();

		expect((await store.findByRound(1)).map(withoutId)).toEqual([playerBoard(1)]);
	});
});
