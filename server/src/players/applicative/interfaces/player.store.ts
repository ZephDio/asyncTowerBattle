import type { Player, PlayerAccount } from "../../domain/player.js";

// Output port of the player use cases: the registered players. Abstract so it can be used as the injection token.
export abstract class PlayerStore {
	abstract create(account: PlayerAccount): Promise<void>;
	abstract findById(id: string): Promise<Player | undefined>;
	abstract findByGoogleId(googleId: string): Promise<Player | undefined>;
	// `email` is in lower case, as playerEmail gives it.
	abstract findByEmail(email: string): Promise<Player | undefined>;
	// Ignores case.
	abstract findByName(name: string): Promise<Player | undefined>;
	// The player who signs in with this email and a password, with the hash of their password.
	abstract findPasswordLogin(email: string): Promise<{ player: Player; passwordHash: string } | undefined>;
	// The same, found by player name, ignoring case.
	abstract findPasswordLoginByName(name: string): Promise<{ player: Player; passwordHash: string } | undefined>;
}
