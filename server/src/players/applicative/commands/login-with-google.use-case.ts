import { Injectable } from "@nestjs/common";
import { GoogleIdentityVerifier } from "../interfaces/google-identity.verifier.js";
import { PlayerStore } from "../interfaces/player.store.js";
import { NoAccountError } from "../player-errors.js";
import { type Session, SessionOpener } from "../session-opener.js";

// Opens the session of a registered player signed in with their Google account.
@Injectable()
export class LoginWithGoogle {
	constructor(
		private readonly google: GoogleIdentityVerifier,
		private readonly players: PlayerStore,
		private readonly sessions: SessionOpener,
	) {}

	async execute({ credential }: { credential: string }): Promise<Session> {
		const identity = await this.google.verify(credential);
		const player = await this.players.findByGoogleId(identity.googleId);
		if (!player) throw new NoAccountError();
		return this.sessions.open(player);
	}
}
