import { InvalidBoardSizeError, InvalidRandomSeedError, InvalidRoundError } from "./opponent-errors.js";
import type { SerializedBoard } from "./serialized-board.js";

export type GridSize = { width: number; height: number };

// The army grid size of each round, from the client's GRID_GROWTH_CYCLE (client/src/engine/grid/grid-sizes.ts). Rounds
// past the end keep the last size. Keep in sync with it, and with the player_board_board_check constraint
// (prisma/migrations/20261118130000_check_board_size_and_seed).
export const ROUND_GRID_SIZES = [
	{ width: 8, height: 6 },
	{ width: 9, height: 7 },
	{ width: 9, height: 7 },
	{ width: 11, height: 7 },
	{ width: 11, height: 7 },
	{ width: 11, height: 7 },
	{ width: 11, height: 7 },
	{ width: 13, height: 8 },
] as const satisfies GridSize[];

export const roundGridSize = (round: number): GridSize =>
	ROUND_GRID_SIZES[Math.min(round, ROUND_GRID_SIZES.length) - 1] ?? ROUND_GRID_SIZES[0];

// The client's BattleRandomSeed works modulo 2**31, so a seed is an integer of [0, 2**31).
export const RANDOM_SEED_RANGE = 2 ** 31;

// The rules every stored board follows: its round starts at 1, its grid has the size of its round and its random seed is
// one BattleRandomSeed takes. Throws the error of the first rule it breaks.
export const assertBoardRules = (board: SerializedBoard) => {
	if (!Number.isInteger(board.round) || board.round < 1) throw new InvalidRoundError(board.round);
	const size = roundGridSize(board.round);
	if (board.size.width !== size.width || board.size.height !== size.height) {
		throw new InvalidBoardSizeError(board.round, size, board.size);
	}
	if (!Number.isInteger(board.randomSeed) || board.randomSeed < 0 || board.randomSeed >= RANDOM_SEED_RANGE) {
		throw new InvalidRandomSeedError(board.randomSeed);
	}
};
