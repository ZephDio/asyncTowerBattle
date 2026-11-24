import { Injectable } from "@nestjs/common";
import { PlayerStepsStore } from "../../applicative/interfaces/player-steps.store.js";
import { PlayerSteps } from "../../domain/player-steps.js";

@Injectable()
export class InMemoryPlayerStepsStore extends PlayerStepsStore {
	private readonly steps = new Map<string, string>();

	async find(playerId: string) {
		const stored = this.steps.get(playerId);
		return stored ? new PlayerSteps(JSON.parse(stored)) : PlayerSteps.none(playerId);
	}

	async save(steps: PlayerSteps) {
		this.steps.set(steps.playerId, JSON.stringify(steps.toProps()));
	}
}
