import { Injectable } from "@nestjs/common";
import { LegacyBoardStore } from "../applicative/interfaces/legacy-board.store.js";
import type { PlayerBoard } from "../domain/player-board.js";

// Keeps every board as its JSON string, like InMemoryOpponentBoardStore.
@Injectable()
export class InMemoryLegacyBoardStore extends LegacyBoardStore {
	private readonly boards: string[] = [];

	async add(playerBoard: PlayerBoard) {
		this.boards.push(JSON.stringify(playerBoard));
	}

	all(): PlayerBoard[] {
		return this.boards.map((board) => JSON.parse(board));
	}
}
