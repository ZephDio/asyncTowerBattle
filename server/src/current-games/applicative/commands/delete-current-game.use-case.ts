import { Injectable } from "@nestjs/common";
import { CurrentGameStore } from "../interfaces/current-game.store.js";

// Forgets the game of a player whose game is over.
@Injectable()
export class DeleteCurrentGame {
	constructor(private readonly currentGames: CurrentGameStore) {}

	async execute(playerId: string): Promise<void> {
		await this.currentGames.delete(playerId);
	}
}
