import type { PlayerBoard } from "./player-board.js";

// A round keeps at least this many boards available: while it holds no more, pulling one of its boards leaves it
// available for the next players.
export const ROUND_POOL_SIZE = 50;

// Whether pulling a board of a round that holds `roundBoardCount` available boards takes it out of them.
export const pullConsumes = (roundBoardCount: number) => roundBoardCount > ROUND_POOL_SIZE;

// The boards to pick an opponent from: the player boards, or the bot boards when there is none.
export const preferPlayerBoards = (boards: PlayerBoard[]) => {
	const playerBoards = boards.filter(({ bot }) => !bot);
	return playerBoards.length > 0 ? playerBoards : boards;
};
