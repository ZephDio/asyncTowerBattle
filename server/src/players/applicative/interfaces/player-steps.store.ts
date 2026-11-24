import type { PlayerSteps } from "../../domain/player-steps.js";

// Output port of the steps use cases: what each registered player went through.
export abstract class PlayerStepsStore {
	// The steps of the player, none done when they have no row.
	abstract find(playerId: string): Promise<PlayerSteps>;
	abstract save(steps: PlayerSteps): Promise<void>;
}
