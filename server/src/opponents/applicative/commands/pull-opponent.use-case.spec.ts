import { roundGridSize } from "../../domain/board-rules.js";
import { type GamePerformance, PlayerBoard, type PlayerBoardProps } from "../../domain/player-board.js";
import type { SerializedBoard } from "../../domain/serialized-board.js";
import { InMemoryLegacyBoardStore } from "../../infrastructure/legacy-board-store/in-memory-legacy-board.store.js";
import { InMemoryOpponentBoardStore } from "../../infrastructure/opponent-board-store/in-memory-opponent-board.store.js";
import { InMemoryPlayerNames } from "../../infrastructure/in-memory-player-names.js";
import { defaultBoard } from "../../domain/default-boards.js";
import { ROUND_POOL_SIZE } from "../../domain/round-pool.js";
import { PullOpponent } from "./pull-opponent.use-case.js";

const board = (round: number, randomSeed = round): SerializedBoard => ({
	round,
	faction: "Dwarf",
	size: roundGridSize(round),
	randomSeed,
	elements: [{ kind: "castle", cell: { x: 0, y: 5 } }],
});

const performance: GamePerformance = { wins: 2, losses: 1 };

// Stores the boards as dave's, a player without a name, so his boards come without one.
const setup = (...boards: SerializedBoard[]) =>
	setupStored(boards.map((stored) => ({ board: stored, performance: { wins: 0, losses: 0 }, playerId: "dave" })));

const setupStored = (stored: Omit<PlayerBoardProps, "id" | "pulledBy">[]) => {
	const opponentBoards = InMemoryOpponentBoardStore.seeded(stored);
	const legacyBoards = new InMemoryLegacyBoardStore();
	const playerNames = new InMemoryPlayerNames({ alice: "Alice" });
	return {
		opponentBoards,
		legacyBoards,
		useCase: new PullOpponent(opponentBoards, legacyBoards, playerNames),
	};
};

// The board a request sends, as the controller makes it.
let sent = 0;
const sentBoard = (round: number, randomSeed: number, playerId?: string) =>
	new PlayerBoard({ id: `sent-${++sent}`, board: board(round, randomSeed), performance, playerId });

// A logged-in player's pull, by a new player unless one is given.
let players = 0;
const pull = (useCase: PullOpponent, round: number, randomSeed = 100 + round, playerId = `player-${++players}`) =>
	useCase.execute({ playerBoard: sentBoard(round, randomSeed, playerId), test: false });

const testPull = (useCase: PullOpponent, round: number) =>
	useCase.execute({ playerBoard: sentBoard(round, 100 + round, "alice"), test: true });

const guestPull = (useCase: PullOpponent, round: number) =>
	useCase.execute({ playerBoard: sentBoard(round, 100 + round), test: false });

// Boards of round 2 another player built.
const playerBoards = (count: number) =>
	Array.from({ length: count }, (_, index) => ({
		board: board(2, 1000 + index),
		performance,
		playerId: "carol",
	}));

const withoutId = ({ board, performance }: PlayerBoard) => ({ board, performance });

describe("PullOpponent", () => {
	const random = Math.random;
	afterEach(() => {
		Math.random = random;
	});

	it("gives a board of the round", async () => {
		expect(await pull(setup(board(1), board(2), board(3)).useCase, 2)).toEqual({ board: board(2) });
	});

	it("never gives a board of another round, even of the same grid size", async () => {
		// Rounds 2 and 3 are both 9x7.
		const { useCase } = setup(board(2), board(8));

		expect(await guestPull(useCase, 3)).toEqual({ board: defaultBoard(3) });
		expect(await guestPull(useCase, 12)).toEqual({ board: defaultBoard(12) });
	});

	it("stores the player's board for the next players of the round", async () => {
		const { opponentBoards, useCase } = setup();

		await pull(useCase, 2, 42);

		const stored = await opponentBoards.findByRound(2);
		expect(stored.map(withoutId)).toEqual([{ board: board(2, 42), performance }]);
		expect(await pull(useCase, 2)).toEqual({ board: board(2, 42) });
	});

	it("gives the round's default board when no stored board fits", async () => {
		expect(await pull(setup().useCase, 2)).toEqual({ board: defaultBoard(2) });
		expect(await guestPull(setup().useCase, 5)).toEqual({ board: defaultBoard(5) });
		expect(await testPull(setup().useCase, 3)).toEqual({ board: defaultBoard(3) });
	});

	it("gives the last default board past the last round that has one", async () => {
		const last = defaultBoard(Number.MAX_SAFE_INTEGER);

		expect(await guestPull(setup().useCase, last.round + 4)).toEqual({ board: last });
	});

	it(`keeps the opponent available while its round holds no more than ${ROUND_POOL_SIZE} boards`, async () => {
		const { opponentBoards, legacyBoards, useCase } = setup(board(3, 30));

		await pull(useCase, 3, 31, "alice");
		await pull(useCase, 3, 32, "alice");

		const stored = await opponentBoards.findByRound(3);
		const aliceBoards = stored.filter(({ playerId }) => playerId === "alice").map(({ id }) => id);
		expect(stored.find(({ playerId }) => playerId === "dave")?.pulledBy).toEqual(aliceBoards);
		expect(legacyBoards.all()).toEqual([]);
	});

	it(`still keeps the opponent when the player's board brings its round to ${ROUND_POOL_SIZE} boards`, async () => {
		const { opponentBoards, legacyBoards, useCase } = setupStored(playerBoards(ROUND_POOL_SIZE - 1));

		await pull(useCase, 2);

		expect(await opponentBoards.count(2)).toBe(ROUND_POOL_SIZE);
		expect(legacyBoards.all()).toEqual([]);
	});

	it(`moves the opponent to the legacy store once its round holds more than ${ROUND_POOL_SIZE} boards`, async () => {
		const { opponentBoards, legacyBoards, useCase } = setupStored(playerBoards(ROUND_POOL_SIZE));
		const [pulledOnce] = await opponentBoards.findByRound(2);
		await opponentBoards.markPulled(pulledOnce!.id, "earlier-puller");

		// The use case picks the first board.
		Math.random = () => 0;

		expect(await pull(useCase, 2)).toEqual({ board: pulledOnce?.board, playerName: undefined });
		const consumed = legacyBoards.all().find(({ id }) => id === pulledOnce?.id);
		expect(consumed?.pulledBy).toHaveLength(2);
		expect(consumed?.pulledBy[0]).toBe("earlier-puller");
		expect(await opponentBoards.count(2)).toBe(ROUND_POOL_SIZE);
		expect((await opponentBoards.findByRound(2)).map(({ id }) => id)).not.toContain(pulledOnce?.id);
	});

	it("gives the name of the player who built the opponent, and none for a default board", async () => {
		const { useCase } = setupStored([{ board: board(2, 20), performance, playerId: "alice" }]);

		expect(await pull(useCase, 2)).toEqual({ board: board(2, 20), playerName: "Alice" });
		expect(await guestPull(useCase, 1)).toEqual({ board: defaultBoard(1) });
	});

	it("never gives the player the board they just sent", async () => {
		expect(await pull(setup().useCase, 1)).toEqual({ board: defaultBoard(1) });
	});

	it("stores the board as the logged-in player's", async () => {
		const { opponentBoards, useCase } = setup(board(1));

		await pull(useCase, 1, 7, "alice");

		const stored = (await opponentBoards.findByRound(1)).filter(({ playerId }) => playerId !== "dave");
		expect(stored.map(({ playerId }) => playerId)).toEqual(["alice"]);
	});

	it("never gives a logged-in player a board of theirs from an earlier request", async () => {
		const { useCase } = setup(board(2, 20));
		await pull(useCase, 3, 31, "alice");

		// Round 3 only has alice's board, so she gets the default board.
		expect(await pull(useCase, 3, 32, "alice")).toEqual({ board: defaultBoard(3) });
		expect([31, 32]).toContain((await pull(useCase, 3, 33, "bob")).board.randomSeed);
	});

	it("still stores the player's board when the opponent is a default board", async () => {
		const { opponentBoards, legacyBoards, useCase } = setup(board(2));

		expect(await pull(useCase, 1, 7)).toEqual({ board: defaultBoard(1) });
		expect((await opponentBoards.findByRound(1)).map(withoutId)).toEqual([{ board: board(1, 7), performance }]);
		expect(legacyBoards.all()).toEqual([]);
	});

	it("gives an opponent to a test request without storing or consuming any board", async () => {
		const { opponentBoards, legacyBoards, useCase } = setup(board(2, 20));

		expect(await testPull(useCase, 2)).toEqual({ board: board(2, 20) });
		expect(await testPull(useCase, 2)).toEqual({ board: board(2, 20) });
		expect((await opponentBoards.findByRound(2)).map((stored) => stored.board)).toEqual([board(2, 20)]);
		expect(legacyBoards.all()).toEqual([]);
	});

	it("doesn't store a test request's board when the opponent is a default board", async () => {
		const { opponentBoards, useCase } = setup();

		await testPull(useCase, 1);
		expect(await opponentBoards.rounds()).toEqual([]);
	});

	it("gives a guest an opponent without storing or consuming any board", async () => {
		const { opponentBoards, legacyBoards, useCase } = setup(board(2, 20));

		expect(await guestPull(useCase, 2)).toEqual({ board: board(2, 20) });
		expect(await guestPull(useCase, 2)).toEqual({ board: board(2, 20) });
		expect((await opponentBoards.findByRound(2)).map((stored) => stored.board)).toEqual([board(2, 20)]);
		expect(legacyBoards.all()).toEqual([]);
	});

	it("doesn't store a guest's board when the opponent is a default board", async () => {
		const { opponentBoards, useCase } = setup();

		await guestPull(useCase, 1);
		expect(await opponentBoards.rounds()).toEqual([]);
	});
});
