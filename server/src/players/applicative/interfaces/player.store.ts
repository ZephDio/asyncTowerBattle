import type { Player, PlayerAccount } from "../../domain/player.js";

// Output port of the player use cases: the registered players. Abstract so it can be used as the injection token.
export abstract class PlayerStore {
	abstract create(account: PlayerAccount): Promise<void>;
	abstract findById(id: string): Promise<Player | undefined>;
	abstract findByGoogleId(googleId: string): Promise<Player | undefined>;
}
