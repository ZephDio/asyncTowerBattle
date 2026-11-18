import { Controller, Get, NotFoundException, UseGuards } from "@nestjs/common";
import { PlayerNotFoundError } from "../applicative/player-errors.js";
import { GetPlayer } from "../applicative/queries/get-player.use-case.js";
import type { Player } from "../domain/player.js";
import { AccessTokenGuard, PlayerId } from "./access-token.guard.js";

@Controller("players")
@UseGuards(AccessTokenGuard)
export class PlayersController {
	constructor(private readonly getPlayer: GetPlayer) {}

	// The profile of the player the access token was issued to.
	@Get("me")
	async me(@PlayerId() playerId: string): Promise<Player> {
		try {
			return await this.getPlayer.execute(playerId);
		} catch (error) {
			if (error instanceof PlayerNotFoundError) throw new NotFoundException(error.message);
			throw error;
		}
	}
}
