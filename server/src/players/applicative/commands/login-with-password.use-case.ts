import { Injectable } from "@nestjs/common";
import { InvalidEmailError } from "../../domain/player-errors.js";
import { playerEmail } from "../../domain/player.js";
import { PasswordHasher } from "../interfaces/password-hasher.js";
import { PlayerStore } from "../interfaces/player.store.js";
import { InvalidPasswordLoginError } from "../player-errors.js";
import { type Session, SessionOpener } from "../session-opener.js";

export type LoginWithPasswordRequest = { email: string; password: string };

// Opens the session of a registered player signed in with their email and password.
@Injectable()
export class LoginWithPassword {
	constructor(
		private readonly passwords: PasswordHasher,
		private readonly players: PlayerStore,
		private readonly sessions: SessionOpener,
	) {}

	async execute({ email, password }: LoginWithPasswordRequest): Promise<Session> {
		const login = await this.findLogin(email);
		if (!login || !(await this.passwords.verify(password, login.passwordHash))) throw new InvalidPasswordLoginError();
		return this.sessions.open(login.player);
	}

	private async findLogin(email: string) {
		try {
			return await this.players.findPasswordLogin(playerEmail(email));
		} catch (error) {
			if (error instanceof InvalidEmailError) return undefined;
			throw error;
		}
	}
}
