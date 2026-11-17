import { Injectable } from "@nestjs/common";
import { LegacyBoardStore } from "../interfaces/legacy-board.store.js";
import { OpponentBoardStore, type StoredPlayerBoard } from "../interfaces/opponent-board.store.js";
import { InvalidPerformanceError, InvalidRoundError } from "../../domain/opponent-errors.js";
import type { PlayerBoard } from "../../domain/player-board.js";
import { BoardRoundMismatchError, NoOpponentError } from "../opponent-errors.js";
import type { SerializedBoard } from "../../domain/serialized-board.js";

// A test request, from a headless or debug run, gets an opponent but leaves both stores as they were.
export type PullOpponentRequest = PlayerBoard & { round: number; test: boolean };

// Trades the player's board for an opponent: the player's board becomes available to the next players of the round,
// and the opponent, a board of the round or of the latest earlier round that has one, moves to the legacy store so no
// one else gets it. The opponent is picked before the player's board is stored, so a player never meets their own.
@Injectable()
export class PullOpponent {
	constructor(
		private readonly opponentBoards: OpponentBoardStore,
		private readonly legacyBoards: LegacyBoardStore,
	) {}

	execute({ round, board, performance, test }: PullOpponentRequest): SerializedBoard {
		if (!Number.isInteger(round) || round < 1) throw new InvalidRoundError(round);
		if (board.round !== round) throw new BoardRoundMismatchError(round, board.round);
		if (![performance.wins, performance.losses].every((count) => Number.isInteger(count) && count >= 0)) {
			throw new InvalidPerformanceError(performance);
		}

		const opponent = this.pickOpponent(round);
		if (test) {
			if (!opponent) throw new NoOpponentError(round);
			return opponent.board;
		}
		this.opponentBoards.add({ board, performance });
		if (!opponent) throw new NoOpponentError(round);
		this.opponentBoards.remove(opponent.id);
		this.legacyBoards.add(opponent);
		return opponent.board;
	}

	private pickOpponent(round: number): StoredPlayerBoard | undefined {
		const earlierRounds = this.opponentBoards.rounds().filter((stored) => stored <= round);
		if (earlierRounds.length === 0) return undefined;
		const opponents = this.opponentBoards.findByRound(Math.max(...earlierRounds));
		return opponents[Math.floor(Math.random() * opponents.length)];
	}
}
