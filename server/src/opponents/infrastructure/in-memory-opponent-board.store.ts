import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { OpponentBoardStore, type StoredPlayerBoard } from "../applicative/interfaces/opponent-board.store.js";
import type { PlayerBoard } from "../domain/player-board.js";

// Keeps every board as its JSON string, grouped by round then by id, so callers never share or mutate a stored board.
@Injectable()
export class InMemoryOpponentBoardStore extends OpponentBoardStore {
	private readonly boardsByRound = new Map<number, Map<string, string>>();

	static seeded(playerBoards: PlayerBoard[]) {
		const store = new InMemoryOpponentBoardStore();
		for (const playerBoard of playerBoards) store.add(playerBoard);
		return store;
	}

	add(playerBoard: PlayerBoard) {
		const id = randomUUID();
		const boards = this.boardsByRound.get(playerBoard.board.round) ?? new Map<string, string>();
		boards.set(id, JSON.stringify({ ...playerBoard, id }));
		this.boardsByRound.set(playerBoard.board.round, boards);
	}

	findByRound(round: number): StoredPlayerBoard[] {
		return [...(this.boardsByRound.get(round)?.values() ?? [])].map((board) => JSON.parse(board));
	}

	remove(id: string) {
		for (const [round, boards] of this.boardsByRound) {
			if (!boards.delete(id)) continue;
			if (boards.size === 0) this.boardsByRound.delete(round);
			return;
		}
	}

	rounds() {
		return [...this.boardsByRound.keys()];
	}
}
