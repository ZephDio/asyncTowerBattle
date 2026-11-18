import { Injectable } from "@nestjs/common";
import { IdProvider } from "../../../shared/applicative/interfaces/id-provider.js";
import { type Player, playerName } from "../../domain/player.js";
import { GoogleIdentityVerifier } from "../interfaces/google-identity.verifier.js";
import { PlayerStore } from "../interfaces/player.store.js";
import { checkNewAccount } from "../new-account-check.js";
import { AccountExistsError } from "../player-errors.js";
import { type Session, SessionOpener } from "../session-opener.js";

export type RegisterWithGoogleRequest = { credential: string; name: string };

// Creates the profile of a player signed in with a Google account that has none yet, and opens their session.
@Injectable()
export class RegisterWithGoogle {
	constructor(
		private readonly google: GoogleIdentityVerifier,
		private readonly players: PlayerStore,
		private readonly sessions: SessionOpener,
		private readonly ids: IdProvider,
	) {}

	async execute({ credential, name }: RegisterWithGoogleRequest): Promise<Session> {
		const validName = playerName(name);
		const identity = await this.google.verify(credential);
		if (await this.players.findByGoogleId(identity.googleId)) throw new AccountExistsError();
		const player: Player = { id: this.ids.next(), email: identity.email.toLowerCase(), name: validName };
		await checkNewAccount(this.players, player);
		await this.players.create({ ...player, googleId: identity.googleId });
		return this.sessions.open(player);
	}
}
