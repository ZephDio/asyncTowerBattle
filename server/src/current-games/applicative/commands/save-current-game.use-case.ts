import { Injectable } from "@nestjs/common";
import type { CurrentGame } from "../../domain/current-game.js";
import { CurrentGameStore } from "../interfaces/current-game.store.js";

export type SaveCurrentGameRequest = { currentGame: CurrentGame };

// Keeps the game the player is playing, in place of the one they saved before.
@Injectable()
export class SaveCurrentGame {
	constructor(private readonly currentGames: CurrentGameStore) {}

	async execute({ currentGame }: SaveCurrentGameRequest): Promise<void> {
		await this.currentGames.save(currentGame);
	}
}
