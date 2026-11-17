import { Injectable } from "@nestjs/common";
import { LegacyBoardStore } from "../applicative/interfaces/legacy-board.store.js";
import type { StoredPlayerBoard } from "../applicative/interfaces/opponent-board.store.js";

// Keeps every board as its JSON string, like InMemoryOpponentBoardStore.
@Injectable()
export class InMemoryLegacyBoardStore extends LegacyBoardStore {
	private readonly boards: string[] = [];

	async add(playerBoard: StoredPlayerBoard) {
		this.boards.push(JSON.stringify(playerBoard));
	}

	all(): StoredPlayerBoard[] {
		return this.boards.map((board) => JSON.parse(board));
	}
}
