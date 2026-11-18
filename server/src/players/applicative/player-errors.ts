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

export class EmailTakenError extends Error {
	constructor() {
		super("A player is already registered with this email");
	}
}

export class NameTakenError extends Error {
	constructor() {
		super("Another player already has this name");
	}
}

// The same error for an unknown email and a wrong password, so a login attempt does not tell which emails have players.
export class InvalidPasswordLoginError extends Error {
	constructor() {
		super("The email or password is wrong");
	}
}
