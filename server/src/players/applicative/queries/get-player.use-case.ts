import { Injectable } from "@nestjs/common";
import type { Player } from "../../domain/player.js";
import { PlayerStore } from "../interfaces/player.store.js";
import { PlayerNotFoundError } from "../player-errors.js";

@Injectable()
export class GetPlayer {
	constructor(private readonly players: PlayerStore) {}

	async execute(id: string): Promise<Player> {
		const player = await this.players.findById(id);
		if (!player) throw new PlayerNotFoundError(id);
		return player;
	}
}
