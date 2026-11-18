import { Injectable } from "@nestjs/common";
import { LegacyBoardStore, type LegacyPlayerBoard } from "../applicative/interfaces/legacy-board.store.js";

// Keeps every board as its JSON string, like InMemoryOpponentBoardStore.
@Injectable()
export class InMemoryLegacyBoardStore extends LegacyBoardStore {
	private readonly boards: string[] = [];

	async add(playerBoard: LegacyPlayerBoard) {
		this.boards.push(JSON.stringify(playerBoard));
	}

	all(): LegacyPlayerBoard[] {
		return this.boards.map((board) => JSON.parse(board));
	}
}
