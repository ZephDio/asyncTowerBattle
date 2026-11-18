import { Injectable } from "@nestjs/common";
import { IdProvider } from "../../../shared/applicative/interfaces/id-provider.js";
import { LegacyBoardStore } from "../interfaces/legacy-board.store.js";
import { OpponentBoardStore } from "../interfaces/opponent-board.store.js";
import { PlayerNames } from "../interfaces/player-names.js";
import { InvalidPerformanceError, InvalidRoundError } from "../../domain/opponent-errors.js";
import { checkBoard, sameGridSize } from "../../domain/checked-board.js";
import type { Opponent } from "../../domain/opponent.js";
import type { PlayerBoard } from "../../domain/player-board.js";
import type { SerializedBoard } from "../../domain/serialized-board.js";
import { BoardRoundMismatchError, NoOpponentError } from "../opponent-errors.js";

// A test request, from a game in dev mode, gets an opponent but leaves both stores as they were, and so does a guest's:
// only a logged-in player's boards are stored and only they consume opponents, so guests and dev runs read for free.
export type PullOpponentRequest = Omit<PlayerBoard, "id" | "board"> & {
	round: number;
	board: SerializedBoard;
	test: boolean;
};

// Every request's board must have the grid size of its round and a valid random seed, see checkBoard.
// Trades a logged-in player's board for an opponent: the player's board becomes available to the next players of the round,
// and the opponent, a board of the round or of the latest earlier round of the same grid size that has one, moves to
// the legacy store so no one else gets it, marked as pulled by the player's board. The opponent is picked before the player's board is stored,
// so a player never meets the board they just sent, and a logged-in player never meets any board of theirs. The opponent
// comes with the name of the player who built it.
@Injectable()
export class PullOpponent {
	constructor(
		private readonly opponentBoards: OpponentBoardStore,
		private readonly legacyBoards: LegacyBoardStore,
		private readonly playerNames: PlayerNames,
		private readonly ids: IdProvider,
	) {}

	async execute({ round, board, performance, playerId, test }: PullOpponentRequest): Promise<Opponent> {
		if (!Number.isInteger(round) || round < 1) throw new InvalidRoundError(round);
		if (board.round !== round) throw new BoardRoundMismatchError(round, board.round);
		const checkedBoard = checkBoard(board);
		if (![performance.wins, performance.losses].every((count) => Number.isInteger(count) && count >= 0)) {
			throw new InvalidPerformanceError(performance);
		}

		const opponent = await this.pickOpponent(round, playerId);
		if (test || !playerId) {
			if (!opponent) throw new NoOpponentError(round);
			return this.withPlayerName(opponent);
		}
		const boardId = this.ids.next();
		await this.opponentBoards.add({ id: boardId, board: checkedBoard, performance, playerId });
		if (!opponent) throw new NoOpponentError(round);
		await this.opponentBoards.remove(opponent.id, boardId);
		await this.legacyBoards.add({ ...opponent, pulledBy: boardId });
		return this.withPlayerName(opponent);
	}

	private async withPlayerName({ board, playerId }: PlayerBoard): Promise<Opponent> {
		const playerName = playerId && (await this.playerNames.find(playerId));
		return playerName ? { board, playerName } : { board };
	}

	private async pickOpponent(round: number, playerId: string | undefined): Promise<PlayerBoard | undefined> {
		const earlierRounds = (await this.opponentBoards.rounds(playerId)).filter(
			(stored) => stored <= round && sameGridSize(stored, round),
		);
		if (earlierRounds.length === 0) return undefined;
		const opponents = await this.opponentBoards.findByRound(Math.max(...earlierRounds), playerId);
		return opponents[Math.floor(Math.random() * opponents.length)];
	}
}
