import type { CurrentGame } from "../../domain/current-game.js";

// Output port of the current game use cases: the game each player left running, at most one per player.
export abstract class CurrentGameStore {
	// Replaces the player's game.
	abstract save(currentGame: CurrentGame): Promise<void>;
	abstract find(playerId: string): Promise<CurrentGame | undefined>;
	// Does nothing when the player has no game.
	abstract delete(playerId: string): Promise<void>;
}
