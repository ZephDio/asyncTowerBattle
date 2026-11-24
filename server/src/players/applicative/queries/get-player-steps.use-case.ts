import { Injectable } from "@nestjs/common";
import type { PlayerSteps } from "../../domain/player-steps.js";
import { PlayerStepsStore } from "../interfaces/player-steps.store.js";

@Injectable()
export class GetPlayerSteps {
	constructor(private readonly steps: PlayerStepsStore) {}

	execute(playerId: string): Promise<PlayerSteps> {
		return this.steps.find(playerId);
	}
}
