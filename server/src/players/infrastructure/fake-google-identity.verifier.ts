import { Injectable } from "@nestjs/common";
import { GoogleIdentityVerifier } from "../applicative/interfaces/google-identity.verifier.js";
import { InvalidGoogleCredentialError } from "../applicative/player-errors.js";
import type { GoogleIdentity } from "../domain/player.js";

// For the tests and the headless game tools: the credential `google:<id>` is the Google account <id>. Anything else
// goes to the fallback verifier when there is one, and is invalid otherwise.
@Injectable()
export class FakeGoogleIdentityVerifier extends GoogleIdentityVerifier {
	constructor(private readonly fallback?: GoogleIdentityVerifier) {
		super();
	}

	async verify(credential: string): Promise<GoogleIdentity> {
		const googleId = credential.match(/^google:(.+)$/)?.[1];
		if (googleId) return { googleId, email: `${googleId}@example.com`, name: `Player ${googleId}` };
		if (this.fallback) return this.fallback.verify(credential);
		throw new InvalidGoogleCredentialError();
	}
}
