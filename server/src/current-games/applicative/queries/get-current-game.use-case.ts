import { Injectable } from "@nestjs/common";
import type { CurrentGame } from "../../domain/current-game.js";
import { CurrentGameStore } from "../interfaces/current-game.store.js";

// A player with no running game is the normal case, so it is an answer, not an error.
@Injectable()
export class GetCurrentGame {
	constructor(private readonly currentGames: CurrentGameStore) {}

	async execute(playerId: string): Promise<CurrentGame | undefined> {
		return this.currentGames.find(playerId);
	}
}
