export class InvalidGoogleCredentialError extends Error {
	constructor() {
		super("The Google credential is invalid or expired");
	}
}

export class NoAccountError extends Error {
	constructor() {
		super("No player is registered with this Google account");
	}
}

export class AccountExistsError extends Error {
	constructor() {
		super("A player is already registered with this Google account");
	}
}

export class InvalidRefreshTokenError extends Error {
	constructor() {
		super("The refresh token is invalid, expired or already used");
	}
}

export class PlayerNotFoundError extends Error {
	constructor(id: string) {
		super(`No player ${id}`);
	}
}
