import { Injectable } from "@nestjs/common";
import { GoogleIdentityVerifier } from "../applicative/interfaces/google-identity.verifier.js";
import { InvalidGoogleCredentialError } from "../applicative/player-errors.js";
import type { GoogleIdentity } from "../domain/player.js";

// For the tests: the credential `google:<id>` is the Google account <id>, anything else is invalid.
@Injectable()
export class FakeGoogleIdentityVerifier extends GoogleIdentityVerifier {
	async verify(credential: string): Promise<GoogleIdentity> {
		const googleId = credential.match(/^google:(.+)$/)?.[1];
		if (!googleId) throw new InvalidGoogleCredentialError();
		return { googleId, email: `${googleId}@example.com`, name: `Player ${googleId}` };
	}
}
