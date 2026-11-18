import { InvalidPerformanceError, InvalidRoundError } from "../../domain/opponent-errors.js";
import type { GamePerformance, PlayerBoard } from "../../domain/player-board.js";
import { BoardRoundMismatchError, NoOpponentError } from "../opponent-errors.js";
import type { SerializedBoard } from "../../domain/serialized-board.js";
import { InMemoryLegacyBoardStore } from "../../infrastructure/in-memory-legacy-board.store.js";
import { InMemoryOpponentBoardStore } from "../../infrastructure/in-memory-opponent-board.store.js";
import { UuidProvider } from "../../../shared/infrastructure/uuid-provider.js";
import { PullOpponent } from "./pull-opponent.use-case.js";

const board = (round: number, randomSeed = round): SerializedBoard => ({
	round,
	faction: "Dwarf",
	size: { width: 8, height: 6 },
	randomSeed,
	elements: [{ kind: "castle", cell: { x: 0, y: 5 } }],
});

const performance: GamePerformance = { wins: 2, losses: 1 };

const setup = (...boards: SerializedBoard[]) => {
	const opponentBoards = InMemoryOpponentBoardStore.seeded(
		boards.map((stored) => ({ board: stored, performance: { wins: 0, losses: 0 } })),
	);
	const legacyBoards = new InMemoryLegacyBoardStore();
	return { opponentBoards, legacyBoards, useCase: new PullOpponent(opponentBoards, legacyBoards, new UuidProvider()) };
};

// A logged-in player's pull, by a new player unless one is given.
let players = 0;
const pull = (useCase: PullOpponent, round: number, randomSeed = 100 + round, playerId = `player-${++players}`) =>
	useCase.execute({ round, board: board(round, randomSeed), performance, playerId, test: false });

const testPull = (useCase: PullOpponent, round: number) =>
	useCase.execute({ round, board: board(round, 100 + round), performance, playerId: "alice", test: true });

const guestPull = (useCase: PullOpponent, round: number) =>
	useCase.execute({ round, board: board(round, 100 + round), performance, test: false });

const withoutId = ({ board, performance }: PlayerBoard) => ({ board, performance });

describe("PullOpponent", () => {
	it("gives a board of the round", async () => {
		expect(await pull(setup(board(1), board(2), board(3)).useCase, 2)).toEqual(board(2));
	});

	it("falls back to the latest earlier round", async () => {
		const { useCase } = setup(board(1), board(4));

		expect(await pull(useCase, 9)).toEqual(board(4));
	});

	it("stores the player's board for the next players of the round", async () => {
		const { opponentBoards, useCase } = setup(board(2));

		await pull(useCase, 2, 42);

		expect((await opponentBoards.findByRound(2)).map(withoutId)).toEqual([{ board: board(2, 42), performance }]);
		expect(await pull(useCase, 2)).toEqual(board(2, 42));
	});

	it("moves the opponent to the legacy store, pulled by the player's board", async () => {
		const { opponentBoards, legacyBoards, useCase } = setup(board(1, 10), board(3, 30));

		await pull(useCase, 3);

		const [playerBoard] = await opponentBoards.findByRound(3);
		expect(playerBoard?.board.randomSeed).toBe(103);
		expect(legacyBoards.all().map(withoutId)).toEqual([{ board: board(3, 30), performance: { wins: 0, losses: 0 } }]);
		expect(legacyBoards.all()[0]?.pulledBy).toBe(playerBoard?.id);
	});

	it("never gives the player the board they just sent", async () => {
		const { useCase } = setup();

		await expect(pull(useCase, 1)).rejects.toThrow(NoOpponentError);
	});

	it("stores the board as the logged-in player's", async () => {
		const { opponentBoards, useCase } = setup(board(1));

		await pull(useCase, 1, 7, "alice");

		expect((await opponentBoards.findByRound(1)).map(({ playerId }) => playerId)).toEqual(["alice"]);
	});

	it("never gives a logged-in player a board of theirs from an earlier request", async () => {
		const { useCase } = setup(board(1, 10), board(2, 20));
		await pull(useCase, 2, 21, "alice");

		// Round 2 only has alice's board left, so she falls back to round 1.
		expect((await pull(useCase, 2, 22, "alice")).randomSeed).toBe(10);
		expect([21, 22]).toContain((await pull(useCase, 2, 23, "bob")).randomSeed);
	});

	it("still stores the player's board when there is no opponent", async () => {
		const { opponentBoards, useCase } = setup(board(2));

		await expect(pull(useCase, 1, 7)).rejects.toThrow(NoOpponentError);
		expect((await opponentBoards.findByRound(1)).map(withoutId)).toEqual([{ board: board(1, 7), performance }]);
	});

	it("gives an opponent to a test request without storing or consuming any board", async () => {
		const { opponentBoards, legacyBoards, useCase } = setup(board(2, 20));

		expect(await testPull(useCase, 2)).toEqual(board(2, 20));
		expect(await testPull(useCase, 2)).toEqual(board(2, 20));
		expect((await opponentBoards.findByRound(2)).map((stored) => stored.board)).toEqual([board(2, 20)]);
		expect(legacyBoards.all()).toEqual([]);
	});

	it("doesn't store a test request's board when there is no opponent", async () => {
		const { opponentBoards, useCase } = setup();

		await expect(testPull(useCase, 1)).rejects.toThrow(NoOpponentError);
		expect(await opponentBoards.rounds()).toEqual([]);
	});

	it("gives a guest an opponent without storing or consuming any board", async () => {
		const { opponentBoards, legacyBoards, useCase } = setup(board(2, 20));

		expect(await guestPull(useCase, 2)).toEqual(board(2, 20));
		expect(await guestPull(useCase, 2)).toEqual(board(2, 20));
		expect((await opponentBoards.findByRound(2)).map((stored) => stored.board)).toEqual([board(2, 20)]);
		expect(legacyBoards.all()).toEqual([]);
	});

	it("doesn't store a guest's board when there is no opponent", async () => {
		const { opponentBoards, useCase } = setup();

		await expect(guestPull(useCase, 1)).rejects.toThrow(NoOpponentError);
		expect(await opponentBoards.rounds()).toEqual([]);
	});

	it.each([0, -1, 1.5])("refuses round %d", async (round) => {
		await expect(pull(setup(board(1)).useCase, round)).rejects.toThrow(InvalidRoundError);
	});

	it("refuses a board of another round", async () => {
		const { opponentBoards, useCase } = setup(board(1));

		await expect(useCase.execute({ round: 2, board: board(1), performance, test: false })).rejects.toThrow(
			BoardRoundMismatchError,
		);
		expect(await opponentBoards.findByRound(1)).toHaveLength(1);
	});

	it.each([
		{ wins: -1, losses: 0 },
		{ wins: 0, losses: 0.5 },
	])("refuses performance %o", async (invalid) => {
		await expect(
			setup(board(1)).useCase.execute({ round: 1, board: board(1), performance: invalid, test: false }),
		).rejects.toThrow(InvalidPerformanceError);
	});
});
