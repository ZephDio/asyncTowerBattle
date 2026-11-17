import { Injectable } from "@nestjs/common";
import { OpponentBoardStore } from "../applicative/interfaces/opponent-board.store.js";
import type { SerializedBoard } from "../domain/serialized-board.js";

// Keeps every board as its JSON string, grouped by round, so callers never share or mutate a stored board.
@Injectable()
export class InMemoryOpponentBoardStore extends OpponentBoardStore {
	private readonly boardsByRound = new Map<number, string[]>();

	static seeded(boards: SerializedBoard[]) {
		const store = new InMemoryOpponentBoardStore();
		boards.forEach((board) => store.add(board));
		return store;
	}

	add(board: SerializedBoard) {
		const boards = this.boardsByRound.get(board.round) ?? [];
		boards.push(JSON.stringify(board));
		this.boardsByRound.set(board.round, boards);
	}

	findByRound(round: number): SerializedBoard[] {
		return (this.boardsByRound.get(round) ?? []).map((board) => JSON.parse(board));
	}

	rounds() {
		return [...this.boardsByRound.keys()];
	}
}
