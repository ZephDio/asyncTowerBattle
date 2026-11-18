import type { GoogleIdentity } from "../../domain/player.js";

// Output port of the sign-in use cases: checks the ID token Google gave the client after the player signed in.
export abstract class GoogleIdentityVerifier {
	// Throws InvalidGoogleCredentialError when the credential is not a valid ID token for this app.
	abstract verify(credential: string): Promise<GoogleIdentity>;
}
