export class InvalidPlayerNameError extends Error {
	constructor({ min, max }: { min: number; max: number }) {
		super(`A player name has ${min} to ${max} characters`);
	}
}

export class InvalidEmailError extends Error {
	constructor() {
		super("The email address is invalid");
	}
}

export class InvalidPasswordError extends Error {
	constructor({ min, max }: { min: number; max: number }) {
		super(`A password has ${min} to ${max} characters`);
	}
}
