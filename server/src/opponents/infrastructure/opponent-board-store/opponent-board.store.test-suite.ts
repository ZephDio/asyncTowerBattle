import type { RandomProvider } from "../../../shared/applicative/interfaces/random-provider.js";
import type { OpponentBoardStore } from "../../applicative/interfaces/opponent-board.store.js";
import { roundGridSize } from "../../domain/board-rules.js";
import { PlayerBoard } from "../../domain/player-board.js";
import type { SerializedBoard } from "../../domain/serialized-board.js";

// What an implementation gives the suite to run on it.
export type OpponentBoardStoreSuiteParams = {
	// A store drawing its random offsets from `random`. Called before each test, after `clear`.
	createStore: (random: RandomProvider) => OpponentBoardStore;
	// Makes a player who can own boards and gives back their id.
	addPlayer: (name: string) => Promise<string>;
	// Deletes the player: their boards stay, owned by nobody.
	removePlayer: (id: string) => Promise<void>;
	// The boards that pulled the board, oldest first, whether it was removed or not. The port never reads a removed
	// board back, so each implementation reads its own storage.
	pullersOf: (id: string) => Promise<readonly string[]>;
	// Empties everything the store and the players keep.
	clear: () => Promise<void>;
	// Releases what the implementation holds (connections) once the suite is done.
	close?: () => Promise<void>;
};

const serializedBoard = (round: number, randomSeed: number): SerializedBoard => ({
	round,
	faction: "Dwarf",
	size: roundGridSize(round),
	randomSeed,
	elements: [{ kind: "castle", cell: { x: 0, y: 5 } }],
});

export const opponentBoard = (round: number, randomSeed: number, playerId?: string) =>
	new PlayerBoard({
		id: crypto.randomUUID(),
		board: serializedBoard(round, randomSeed),
		performance: { wins: 2, losses: 1 },
		playerId,
	});

// The behavior every OpponentBoardStore must have, checked through the port alone. Each implementation's spec calls it
// with its params, then adds the checks only it can make (rows, indexes, projections, test helpers).
export const opponentBoardStoreSuite = (name: string, params: OpponentBoardStoreSuiteParams) =>
	describe(`${name} (OpponentBoardStore suite)`, () => {
		let store: OpponentBoardStore;
		// The offsets the store draws, in [0, 1). Each test sets the ones it needs; 0 picks the oldest board.
		let offsets: number[] = [];
		const random: RandomProvider = { next: () => offsets.shift() ?? 0 };

		beforeEach(async () => {
			offsets = [];
			await params.clear();
			store = params.createStore(random);
		});

		afterAll(async () => {
			await params.close?.();
		});

		// Adds the boards one at a time, so they are stored in the order given.
		const addAll = async (boards: PlayerBoard[]) => {
			for (const board of boards) await store.add(board);
			return boards;
		};

		const pickedSeeds = async (round: number, pulls: number, notOwnedBy?: string) => {
			const seeds = [];
			for (let pull = 0; pull < pulls; pull++) seeds.push((await store.pickOne(round, notOwnedBy))?.board.randomSeed);
			return seeds;
		};

		describe("count", () => {
			it("counts nothing in a round without boards", async () => {
				expect(await store.count(3)).toBe(0);
			});

			it("counts the boards added to each round", async () => {
				await addAll([opponentBoard(1, 10), opponentBoard(3, 30), opponentBoard(3, 31)]);

				expect(await store.count(1)).toBe(1);
				expect(await store.count(3)).toBe(2);
				expect(await store.count(2)).toBe(0);
			});
		});

		describe("pickOne", () => {
			it("gives back the added board as an equal PlayerBoard", async () => {
				const alice = await params.addPlayer("alice");
				const [added] = await addAll([opponentBoard(2, 20, alice)]);

				expect(await store.pickOne(2)).toEqual(added);
			});

			it("gives back a guest's board without a player", async () => {
				const [added] = await addAll([opponentBoard(2, 20)]);

				const picked = await store.pickOne(2);
				expect(picked).toEqual(added);
				expect(picked?.playerId).toBeUndefined();
			});

			it("picks a board of the asked round only", async () => {
				await addAll([opponentBoard(2, 20), opponentBoard(3, 30), opponentBoard(5, 50)]);

				expect((await store.pickOne(3))?.board.randomSeed).toBe(30);
				expect(await store.pickOne(4)).toBeUndefined();
			});

			it("picks the board at the random offset among the round's boards, oldest first", async () => {
				await addAll([opponentBoard(2, 20), opponentBoard(2, 21), opponentBoard(2, 22), opponentBoard(3, 30)]);
				offsets = [0, 0.5, 0.99];

				expect(await pickedSeeds(2, 3)).toEqual([20, 21, 22]);
			});

			it("leaves out the boards of the given player", async () => {
				const alice = await params.addPlayer("alice");
				const bob = await params.addPlayer("bob");
				await addAll([opponentBoard(2, 20, alice), opponentBoard(2, 21, bob), opponentBoard(3, 30, alice)]);

				expect((await store.pickOne(2, alice))?.board.randomSeed).toBe(21);
				expect(await store.pickOne(3, alice)).toBeUndefined();
				expect((await store.pickOne(3))?.board.randomSeed).toBe(30);
			});

			it("keeps guests' boards and boards of deleted players when leaving out a player", async () => {
				const alice = await params.addPlayer("alice");
				const carol = await params.addPlayer("carol");
				await addAll([opponentBoard(2, 20), opponentBoard(2, 21, carol), opponentBoard(2, 22, alice)]);
				await params.removePlayer(carol);
				offsets = [0, 0.99];

				expect((await store.pickOne(2, alice))?.board.randomSeed).toBe(20);
				const orphan = await store.pickOne(2, alice);
				expect(orphan?.board.randomSeed).toBe(21);
				expect(orphan?.playerId).toBeUndefined();
			});
		});

		describe("markPulled", () => {
			it("records every puller in order and keeps the board available", async () => {
				const [added] = await addAll([opponentBoard(2, 20)]);
				const [first, second] = [crypto.randomUUID(), crypto.randomUUID()];

				await store.markPulled(added!.id, first);
				await store.markPulled(added!.id, second);

				expect(await store.pickOne(2)).toEqual(added?.pulledByBoard(first).pulledByBoard(second));
				expect(await store.count(2)).toBe(1);
			});

			it("records the puller of a board removed meanwhile", async () => {
				const [removed] = await addAll([opponentBoard(2, 20)]);
				const [consumer, late] = [crypto.randomUUID(), crypto.randomUUID()];
				await store.remove(removed!.id, consumer);

				await store.markPulled(removed!.id, late);

				expect(await params.pullersOf(removed!.id)).toEqual([consumer, late]);
				expect(await store.pickOne(2)).toBeUndefined();
			});
		});

		describe("remove", () => {
			it("takes the board out of its round only, keeping its puller", async () => {
				const [removed] = await addAll([opponentBoard(2, 20), opponentBoard(2, 21), opponentBoard(3, 30)]);
				const puller = crypto.randomUUID();
				offsets = [0, 0.99];

				await store.remove(removed!.id, puller);

				expect(await store.count(2)).toBe(1);
				expect(await store.count(3)).toBe(1);
				expect(await pickedSeeds(2, 2)).toEqual([21, 21]);
				expect(await params.pullersOf(removed!.id)).toEqual([puller]);
			});

			it("finds nothing once every board of the round is removed", async () => {
				const [only] = await addAll([opponentBoard(2, 20)]);

				await store.remove(only!.id, crypto.randomUUID());

				expect(await store.count(2)).toBe(0);
				expect(await store.pickOne(2)).toBeUndefined();
			});

			it("counts a board out once when removed again, still recording the puller", async () => {
				const [removed] = await addAll([opponentBoard(2, 20), opponentBoard(2, 21)]);
				const [first, second] = [crypto.randomUUID(), crypto.randomUUID()];

				await store.remove(removed!.id, first);
				await store.remove(removed!.id, second);

				expect(await store.count(2)).toBe(1);
				expect(await params.pullersOf(removed!.id)).toEqual([first, second]);
			});

			it("counts a board out once under concurrent removes, recording every puller", async () => {
				const [removed] = await addAll([opponentBoard(2, 20), opponentBoard(2, 21)]);
				const pullers = Array.from({ length: 8 }, () => crypto.randomUUID());

				await Promise.all(pullers.map((puller) => store.remove(removed!.id, puller)));

				expect(await store.count(2)).toBe(1);
				expect([...(await params.pullersOf(removed!.id))].sort()).toEqual([...pullers].sort());
			});
		});
	});
