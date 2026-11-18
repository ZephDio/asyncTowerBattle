import { Injectable } from "@nestjs/common";
import { IdProvider } from "../../../shared/applicative/interfaces/id-provider.js";
import { LegacyBoardStore } from "../interfaces/legacy-board.store.js";
import { OpponentBoardStore } from "../interfaces/opponent-board.store.js";
import { InvalidPerformanceError, InvalidRoundError } from "../../domain/opponent-errors.js";
import type { PlayerBoard } from "../../domain/player-board.js";
import { BoardRoundMismatchError, NoOpponentError } from "../opponent-errors.js";
import type { SerializedBoard } from "../../domain/serialized-board.js";

// A test request, from a headless or debug run, gets an opponent but leaves both stores as they were.
export type PullOpponentRequest = Omit<PlayerBoard, "id"> & { round: number; test: boolean };

// Trades the player's board for an opponent: the player's board becomes available to the next players of the round,
// and the opponent, a board of the round or of the latest earlier round that has one, moves to the legacy store so no
// one else gets it, marked as pulled by the player's board. The opponent is picked before the player's board is stored,
// so a player never meets the board they just sent, and a logged-in player never meets any board of theirs.
@Injectable()
export class PullOpponent {
	constructor(
		private readonly opponentBoards: OpponentBoardStore,
		private readonly legacyBoards: LegacyBoardStore,
		private readonly ids: IdProvider,
	) {}

	async execute({ round, board, performance, playerId, test }: PullOpponentRequest): Promise<SerializedBoard> {
		if (!Number.isInteger(round) || round < 1) throw new InvalidRoundError(round);
		if (board.round !== round) throw new BoardRoundMismatchError(round, board.round);
		if (![performance.wins, performance.losses].every((count) => Number.isInteger(count) && count >= 0)) {
			throw new InvalidPerformanceError(performance);
		}

		const opponent = await this.pickOpponent(round, playerId);
		if (test) {
			if (!opponent) throw new NoOpponentError(round);
			return opponent.board;
		}
		const boardId = this.ids.next();
		await this.opponentBoards.add({ id: boardId, board, performance, playerId });
		if (!opponent) throw new NoOpponentError(round);
		await this.opponentBoards.remove(opponent.id, boardId);
		await this.legacyBoards.add({ ...opponent, pulledBy: boardId });
		return opponent.board;
	}

	private async pickOpponent(round: number, playerId: string | undefined): Promise<PlayerBoard | undefined> {
		const earlierRounds = (await this.opponentBoards.rounds(playerId)).filter((stored) => stored <= round);
		if (earlierRounds.length === 0) return undefined;
		const opponents = await this.opponentBoards.findByRound(Math.max(...earlierRounds), playerId);
		return opponents[Math.floor(Math.random() * opponents.length)];
	}
}
