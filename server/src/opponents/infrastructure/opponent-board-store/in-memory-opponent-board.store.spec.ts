import { roundGridSize } from "../../domain/board-rules.js";
import type { PlayerBoard, PlayerBoardProps } from "../../domain/player-board.js";
import { InMemoryOpponentBoardStore } from "./in-memory-opponent-board.store.js";
import { opponentBoardStoreSuite } from "./opponent-board.store.test-suite.js";

// The in-memory store keeps no players: a player is only an id on their boards.
let current: InMemoryOpponentBoardStore;

opponentBoardStoreSuite("InMemoryOpponentBoardStore", {
	createStore: (random) => {
		current = new InMemoryOpponentBoardStore(random);
		return current;
	},
	addPlayer: async () => crypto.randomUUID(),
	removePlayer: (id) => current.forgetPlayer(id),
	pullersOf: (id) => current.pullersOf(id),
	clear: async () => {},
});

const playerBoard = (round: number, randomSeed = round): Omit<PlayerBoardProps, "id" | "pulledBy"> => ({
	board: {
		round,
		faction: "Dwarf",
		size: roundGridSize(round),
		randomSeed,
		elements: [{ kind: "castle", cell: { x: 0, y: 5 } }],
	},
	performance: { wins: 1, losses: 0 },
});

const withoutId = ({ board, performance }: PlayerBoard) => ({ board, performance });

describe("InMemoryOpponentBoardStore test helpers", () => {
	it("groups the boards by round", async () => {
		const store = InMemoryOpponentBoardStore.seeded([playerBoard(1), playerBoard(3, 30), playerBoard(3, 31)]);

		expect(await store.rounds()).toEqual([1, 3]);
		expect((await store.findByRound(3)).map(withoutId)).toEqual([playerBoard(3, 30), playerBoard(3, 31)]);
		expect(await store.findByRound(2)).toEqual([]);
	});

	it("drops a round once its last board is removed", async () => {
		const store = InMemoryOpponentBoardStore.seeded([playerBoard(1), playerBoard(3, 30)]);
		const [only] = await store.findByRound(3);

		await store.remove(only!.id, "puller");

		expect(await store.rounds()).toEqual([1]);
	});

	it("leaves out the rounds and boards of a player", async () => {
		const store = InMemoryOpponentBoardStore.seeded([
			playerBoard(1),
			{ ...playerBoard(2, 20), playerId: "alice" },
			{ ...playerBoard(2, 21), playerId: "bob" },
			{ ...playerBoard(3, 30), playerId: "alice" },
		]);

		expect(await store.rounds("alice")).toEqual([1, 2]);
		expect((await store.findByRound(2, "alice")).map(({ board }) => board.randomSeed)).toEqual([21]);
		expect(await store.rounds()).toEqual([1, 2, 3]);
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
