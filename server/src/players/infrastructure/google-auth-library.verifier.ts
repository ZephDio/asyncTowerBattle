import { Injectable } from "@nestjs/common";
import { OAuth2Client } from "google-auth-library";
import { GoogleIdentityVerifier } from "../applicative/interfaces/google-identity.verifier.js";
import { InvalidGoogleCredentialError } from "../applicative/player-errors.js";
import type { GoogleIdentity } from "../domain/player.js";

// Checks the ID token's signature against Google's keys, and that it was issued to the OAuth client GOOGLE_CLIENT_ID,
// the one the game's sign-in button uses. The variable is read on use, so the server still serves opponents without it.
@Injectable()
export class GoogleAuthLibraryVerifier extends GoogleIdentityVerifier {
	private readonly client = new OAuth2Client();

	async verify(credential: string): Promise<GoogleIdentity> {
		const audience = process.env["GOOGLE_CLIENT_ID"];
		if (!audience) throw new Error("GOOGLE_CLIENT_ID is not set: Google sign-in is disabled");
		const payload = await this.client
			.verifyIdToken({ idToken: credential, audience })
			.then((ticket) => ticket.getPayload())
			.catch(() => undefined);
		if (!payload?.email || !payload.email_verified) throw new InvalidGoogleCredentialError();
		return { googleId: payload.sub, email: payload.email, name: payload.name ?? payload.email };
	}
}
