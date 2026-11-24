import { Controller, Get, HttpCode, Post, UseGuards } from "@nestjs/common";
import { SeeTutorial } from "../applicative/commands/see-tutorial.use-case.js";
import { GetPlayerSteps } from "../applicative/queries/get-player-steps.use-case.js";
import { AccessTokenGuard, PlayerId } from "./access-token.guard.js";

@Controller("players/me/steps")
@UseGuards(AccessTokenGuard)
export class PlayerStepsController {
	constructor(
		private readonly getPlayerSteps: GetPlayerSteps,
		private readonly seeTutorial: SeeTutorial,
	) {}

	@Get()
	async steps(@PlayerId() playerId: string) {
		const { tutorialSeen } = await this.getPlayerSteps.execute(playerId);
		return { tutorialSeen };
	}

	// The game opened the tutorial by itself for the player.
	@Post("tutorial-seen")
	@HttpCode(204)
	async tutorialSeen(@PlayerId() playerId: string) {
		await this.seeTutorial.execute(playerId);
	}
}
