import { Injectable } from "@nestjs/common";
import { InvalidEmailError } from "../../domain/player-errors.js";
import { playerEmail } from "../../domain/player.js";
import { PasswordHasher } from "../interfaces/password-hasher.js";
import { PlayerStore } from "../interfaces/player.store.js";
import { InvalidPasswordLoginError } from "../player-errors.js";
import { type Session, SessionOpener } from "../session-opener.js";

export type LoginWithPasswordRequest = { identifier: string; password: string };

// Opens the session of a registered player signed in with their email or player name, and their password.
@Injectable()
export class LoginWithPassword {
	constructor(
		private readonly passwords: PasswordHasher,
		private readonly players: PlayerStore,
		private readonly sessions: SessionOpener,
	) {}

	async execute({ identifier, password }: LoginWithPasswordRequest): Promise<Session> {
		const login = await this.findLogin(identifier);
		if (!login || !(await this.passwords.verify(password, login.passwordHash))) throw new InvalidPasswordLoginError();
		return this.sessions.open(login.player);
	}

	private async findLogin(identifier: string) {
		return (await this.findByEmail(identifier)) ?? this.players.findPasswordLoginByName(identifier.trim());
	}

	private async findByEmail(identifier: string) {
		try {
			return await this.players.findPasswordLogin(playerEmail(identifier));
		} catch (error) {
			if (error instanceof InvalidEmailError) return undefined;
			throw error;
		}
	}
}
