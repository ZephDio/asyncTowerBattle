import { Injectable } from "@nestjs/common";
import { CurrentGameStore } from "../../applicative/interfaces/current-game.store.js";
import { CurrentGame } from "../../domain/current-game.js";

// Keeps every game as its JSON string, so callers never share a stored object.
@Injectable()
export class InMemoryCurrentGameStore extends CurrentGameStore {
	private readonly games = new Map<string, string>();

	async save(currentGame: CurrentGame) {
		this.games.set(currentGame.playerId, JSON.stringify(currentGame.toProps()));
	}

	async find(playerId: string) {
		const stored = this.games.get(playerId);
		return stored ? new CurrentGame(JSON.parse(stored)) : undefined;
	}

	async delete(playerId: string) {
		this.games.delete(playerId);
	}
}
