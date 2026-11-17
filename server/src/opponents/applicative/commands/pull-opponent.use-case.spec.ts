import { InvalidPerformanceError, InvalidRoundError } from "../../domain/opponent-errors.js";
import type { GamePerformance, PlayerBoard } from "../../domain/player-board.js";
import { BoardRoundMismatchError, NoOpponentError } from "../opponent-errors.js";
import type { SerializedBoard } from "../../domain/serialized-board.js";
import { InMemoryLegacyBoardStore } from "../../infrastructure/in-memory-legacy-board.store.js";
import { InMemoryOpponentBoardStore } from "../../infrastructure/in-memory-opponent-board.store.js";
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
	return { opponentBoards, legacyBoards, useCase: new PullOpponent(opponentBoards, legacyBoards) };
};

const pull = (useCase: PullOpponent, round: number, randomSeed = 100 + round) =>
	useCase.execute({ round, board: board(round, randomSeed), performance, test: false });

const testPull = (useCase: PullOpponent, round: number) =>
	useCase.execute({ round, board: board(round, 100 + round), performance, test: true });

const withoutId = ({ board, performance }: PlayerBoard) => ({ board, performance });

describe("PullOpponent", () => {
	it("gives a board of the round", () => {
		expect(pull(setup(board(1), board(2), board(3)).useCase, 2)).toEqual(board(2));
	});

	it("falls back to the latest earlier round", () => {
		const { useCase } = setup(board(1), board(4));

		expect(pull(useCase, 9)).toEqual(board(4));
	});

	it("stores the player's board for the next players of the round", () => {
		const { opponentBoards, useCase } = setup(board(2));

		pull(useCase, 2, 42);

		expect(opponentBoards.findByRound(2).map(withoutId)).toEqual([{ board: board(2, 42), performance }]);
		expect(pull(useCase, 2)).toEqual(board(2, 42));
	});

	it("moves the opponent to the legacy store", () => {
		const { opponentBoards, legacyBoards, useCase } = setup(board(1, 10), board(3, 30));

		pull(useCase, 3);

		expect(opponentBoards.findByRound(3).map((stored) => stored.board.randomSeed)).toEqual([103]);
		expect(legacyBoards.all().map(withoutId)).toEqual([{ board: board(3, 30), performance: { wins: 0, losses: 0 } }]);
	});

	it("never gives the player their own board", () => {
		const { useCase } = setup();

		expect(() => pull(useCase, 1)).toThrow(NoOpponentError);
	});

	it("still stores the player's board when there is no opponent", () => {
		const { opponentBoards, useCase } = setup(board(2));

		expect(() => pull(useCase, 1, 7)).toThrow(NoOpponentError);
		expect(opponentBoards.findByRound(1).map(withoutId)).toEqual([{ board: board(1, 7), performance }]);
	});

	it("gives an opponent to a test request without storing or consuming any board", () => {
		const { opponentBoards, legacyBoards, useCase } = setup(board(2, 20));

		expect(testPull(useCase, 2)).toEqual(board(2, 20));
		expect(testPull(useCase, 2)).toEqual(board(2, 20));
		expect(opponentBoards.findByRound(2).map((stored) => stored.board)).toEqual([board(2, 20)]);
		expect(legacyBoards.all()).toEqual([]);
	});

	it("doesn't store a test request's board when there is no opponent", () => {
		const { opponentBoards, useCase } = setup();

		expect(() => testPull(useCase, 1)).toThrow(NoOpponentError);
		expect(opponentBoards.rounds()).toEqual([]);
	});

	it.each([0, -1, 1.5])("refuses round %d", (round) => {
		expect(() => pull(setup(board(1)).useCase, round)).toThrow(InvalidRoundError);
	});

	it("refuses a board of another round", () => {
		const { opponentBoards, useCase } = setup(board(1));

		expect(() => useCase.execute({ round: 2, board: board(1), performance, test: false })).toThrow(
			BoardRoundMismatchError,
		);
		expect(opponentBoards.findByRound(1)).toHaveLength(1);
	});

	it.each([
		{ wins: -1, losses: 0 },
		{ wins: 0, losses: 0.5 },
	])("refuses performance %o", (invalid) => {
		expect(() =>
			setup(board(1)).useCase.execute({ round: 1, board: board(1), performance: invalid, test: false }),
		).toThrow(InvalidPerformanceError);
	});
});
