import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Put, UseGuards } from "@nestjs/common";
import { PlayerBoardRuleError } from "../../opponents/domain/opponent-errors.js";
import { AccessTokenGuard, PlayerId } from "../../players/infrastructure/access-token.guard.js";
import { DeleteCurrentGame } from "../applicative/commands/delete-current-game.use-case.js";
import { SaveCurrentGame } from "../applicative/commands/save-current-game.use-case.js";
import { GetCurrentGame } from "../applicative/queries/get-current-game.use-case.js";
import { CurrentGame, type SavedGame } from "../domain/current-game.js";
import { CurrentGameRuleError } from "../domain/current-game-errors.js";
import { parseSavedGame } from "./saved-game-body.js";

@Controller("current-game")
@UseGuards(AccessTokenGuard)
export class CurrentGamesController {
	constructor(
		private readonly saveCurrentGame: SaveCurrentGame,
		private readonly getCurrentGame: GetCurrentGame,
		private readonly deleteCurrentGame: DeleteCurrentGame,
	) {}

	// The game the player left running, `null` when they have none.
	@Get()
	async current(@PlayerId() playerId: string): Promise<{ game: SavedGame | null }> {
		const currentGame = await this.getCurrentGame.execute(playerId);
		return { game: currentGame?.game ?? null };
	}

	// Replaces the player's running game with the one of the body, the start of a shop or of a battle.
	@Put()
	@HttpCode(204)
	async save(@Body() body: unknown, @PlayerId() playerId: string): Promise<void> {
		const game = parseSavedGame(body);
		await this.saveCurrentGame.execute({ currentGame: this.toCurrentGame(playerId, game) });
	}

	// The player's game is over.
	@Delete()
	@HttpCode(204)
	async end(@PlayerId() playerId: string): Promise<void> {
		await this.deleteCurrentGame.execute(playerId);
	}

	private toCurrentGame(playerId: string, game: SavedGame) {
		try {
			return new CurrentGame({ playerId, game });
		} catch (error) {
			if (error instanceof CurrentGameRuleError || error instanceof PlayerBoardRuleError) {
				throw new BadRequestException(error.message);
			}
			throw error;
		}
	}
}
