import { Injectable } from "@nestjs/common";
import { LegacyBoardStore } from "../interfaces/legacy-board.store.js";
import { OpponentBoardStore } from "../interfaces/opponent-board.store.js";
import { PlayerNames } from "../interfaces/player-names.js";
import type { Opponent } from "../../domain/opponent.js";
import type { PlayerBoard } from "../../domain/player-board.js";
import { defaultBoard } from "../../domain/default-boards.js";
import { pullConsumes } from "../../domain/round-pool.js";

// A test request, from a game in dev mode, gets an opponent but leaves both stores as they were, and so does a guest's:
// only a logged-in player's boards are stored and only they consume opponents, so guests and dev runs read for free.
// The board the player sent, already a valid PlayerBoard: the controller refuses any request that can't make one.
export type PullOpponentRequest = { playerBoard: PlayerBoard; test: boolean };

// Trades a logged-in player's board for an opponent: the player's board becomes available to the next players of the
// round, and the opponent, a board of the same round, is marked as pulled by the player's board. Once its round holds more than ROUND_POOL_SIZE boards, the opponent also moves
// to the legacy store so no one else gets it; until then it stays available. The opponent is picked before the player's
// board is stored, so a player never meets the board they just sent, and a logged-in player never meets any board of
// theirs. When no stored board fits, the opponent is the round's default board, which no store holds, and the player's
// board is stored all the same. The opponent comes with the name of the player who built it.
@Injectable()
export class PullOpponent {
	constructor(
		private readonly opponentBoards: OpponentBoardStore,
		private readonly legacyBoards: LegacyBoardStore,
		private readonly playerNames: PlayerNames,
	) {}

	async execute({ playerBoard, test }: PullOpponentRequest): Promise<Opponent> {
		const { round, playerId } = playerBoard;
		const opponent = await this.opponentBoards.pickOne(round, playerId);
		if (!test && playerId) await this.trade(playerBoard, opponent);
		return this.describe(opponent, round);
	}

	// Stores the player's board for the next players, then records that it pulled the opponent, if a stored one.
	private async trade(playerBoard: PlayerBoard, opponent?: PlayerBoard) {
		await this.opponentBoards.add(playerBoard);
		if (opponent) await this.recordPull(opponent, playerBoard.id);
	}

	// The opponent stays available while its round's pool isn't full, and moves to the legacy store once it is.
	private async recordPull(opponent: PlayerBoard, boardId: string) {
		if (pullConsumes(await this.opponentBoards.count(opponent.round))) return this.consume(opponent, boardId);
		await this.opponentBoards.markPulled(opponent.id, boardId);
	}

	private async consume(opponent: PlayerBoard, boardId: string) {
		await this.opponentBoards.remove(opponent.id, boardId);
		await this.legacyBoards.add(opponent.pulledByBoard(boardId));
	}

	// A stored opponent comes with its player's name, the default board of the round with none.
	private async describe(opponent: PlayerBoard | undefined, round: number): Promise<Opponent> {
		if (!opponent) return { board: defaultBoard(round) };
		return this.withPlayerName(opponent);
	}

	private async withPlayerName({ board, playerId }: PlayerBoard): Promise<Opponent> {
		const playerName = playerId && (await this.playerNames.find(playerId));
		return playerName ? { board, playerName } : { board };
	}
}
