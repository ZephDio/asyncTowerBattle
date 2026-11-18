import { Injectable } from "@nestjs/common";
import { IdProvider } from "../../shared/applicative/interfaces/id-provider.js";
import { UuidProvider } from "../../shared/infrastructure/uuid-provider.js";
import { OpponentBoardStore } from "../applicative/interfaces/opponent-board.store.js";
import type { PlayerBoard } from "../domain/player-board.js";

// Keeps every board as its JSON string, grouped by round then by id, so callers never share or mutate a stored board.
@Injectable()
export class InMemoryOpponentBoardStore extends OpponentBoardStore {
	private readonly boardsByRound = new Map<number, Map<string, string>>();

	// For the tests: gives the boards their ids, like the seed migration does.
	static seeded(playerBoards: Omit<PlayerBoard, "id">[], ids: IdProvider = new UuidProvider()) {
		const store = new InMemoryOpponentBoardStore();
		for (const playerBoard of playerBoards) store.addNow({ ...playerBoard, id: ids.next() });
		return store;
	}

	async add(playerBoard: PlayerBoard) {
		this.addNow(playerBoard);
	}

	private addNow(playerBoard: PlayerBoard) {
		const boards = this.boardsByRound.get(playerBoard.board.round) ?? new Map<string, string>();
		boards.set(playerBoard.id, JSON.stringify(playerBoard));
		this.boardsByRound.set(playerBoard.board.round, boards);
	}

	async findByRound(round: number, notOwnedBy?: string): Promise<PlayerBoard[]> {
		return [...(this.boardsByRound.get(round)?.values() ?? [])]
			.map((board): PlayerBoard => JSON.parse(board))
			.filter((board) => notOwnedBy === undefined || board.playerId !== notOwnedBy);
	}

	// Nothing keeps the pulled boards, so `pulledBy` only matters to the legacy store.
	async remove(id: string, _pulledBy: string) {
		for (const [round, boards] of this.boardsByRound) {
			if (!boards.delete(id)) continue;
			if (boards.size === 0) this.boardsByRound.delete(round);
			return;
		}
	}

	async rounds(notOwnedBy?: string) {
		const rounds: number[] = [];
		for (const round of this.boardsByRound.keys()) {
			if ((await this.findByRound(round, notOwnedBy)).length > 0) rounds.push(round);
		}
		return rounds;
	}
}
