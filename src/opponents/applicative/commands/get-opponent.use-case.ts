import { Injectable } from "@nestjs/common";
import { OpponentBoardStore } from "../interfaces/opponent-board.store.js";
import { InvalidRoundError } from "../../domain/opponent-errors.js";
import { NoOpponentError } from "../opponent-errors.js";
import type { SerializedBoard } from "../../domain/serialized-board.js";

// Picks a board of the round, or of the latest earlier round that has one: past the last stored round, opponents
// keep coming from it.
@Injectable()
export class GetOpponent {
	constructor(private readonly store: OpponentBoardStore) {}

	execute(round: number): SerializedBoard {
		if (!Number.isInteger(round) || round < 1) throw new InvalidRoundError(round);
		const earlierRounds = this.store.rounds().filter((stored) => stored <= round);
		if (earlierRounds.length === 0) throw new NoOpponentError(round);
		const boards = this.store.findByRound(Math.max(...earlierRounds));
		const board = boards[Math.floor(Math.random() * boards.length)];
		if (!board) throw new NoOpponentError(round);
		return board;
	}
}
