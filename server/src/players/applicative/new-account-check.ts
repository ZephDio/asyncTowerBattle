import type { PlayerStore } from "./interfaces/player.store.js";
import { EmailTakenError, NameTakenError } from "./player-errors.js";

// Shared by the register use cases: no two players share an email, or a name ignoring case.
export const checkNewAccount = async (players: PlayerStore, { email, name }: { email: string; name: string }) => {
	const [byEmail, byName] = await Promise.all([players.findByEmail(email), players.findByName(name)]);
	if (byEmail) throw new EmailTakenError();
	if (byName) throw new NameTakenError();
};
