// Output port of the session use cases: the short-lived tokens a player sends with their requests.
export abstract class AccessTokens {
	abstract issue(playerId: string): Promise<string>;
	// The player the token was issued to, or undefined when it is invalid or expired.
	abstract verify(token: string): Promise<string | undefined>;
}
