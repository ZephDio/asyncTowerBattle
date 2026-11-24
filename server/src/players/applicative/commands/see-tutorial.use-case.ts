import { Injectable } from "@nestjs/common";
import { PlayerStepsStore } from "../interfaces/player-steps.store.js";

@Injectable()
export class SeeTutorial {
	constructor(private readonly steps: PlayerStepsStore) {}

	async execute(playerId: string): Promise<void> {
		const steps = await this.steps.find(playerId);
		await this.steps.save(steps.withTutorialSeen());
	}
}
