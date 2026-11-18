import { Injectable } from "@nestjs/common";
import { IdProvider } from "../../../shared/applicative/interfaces/id-provider.js";
import { type Player, playerEmail, playerName, playerPassword } from "../../domain/player.js";
import { PasswordHasher } from "../interfaces/password-hasher.js";
import { PlayerStore } from "../interfaces/player.store.js";
import { checkNewAccount } from "../new-account-check.js";
import { type Session, SessionOpener } from "../session-opener.js";

export type RegisterWithPasswordRequest = { email: string; name: string; password: string };

// Creates a player who signs in with their email and password, and opens their session.
@Injectable()
export class RegisterWithPassword {
	constructor(
		private readonly passwords: PasswordHasher,
		private readonly players: PlayerStore,
		private readonly sessions: SessionOpener,
		private readonly ids: IdProvider,
	) {}

	async execute({ email, name, password }: RegisterWithPasswordRequest): Promise<Session> {
		const player: Player = { id: this.ids.next(), email: playerEmail(email), name: playerName(name) };
		const validPassword = playerPassword(password);
		await checkNewAccount(this.players, player);
		await this.players.create({ ...player, passwordHash: await this.passwords.hash(validPassword) });
		return this.sessions.open(player);
	}
}
