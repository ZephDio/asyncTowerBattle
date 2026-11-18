export class InvalidPlayerNameError extends Error {
	constructor({ min, max }: { min: number; max: number }) {
		super(`A player name has ${min} to ${max} characters`);
	}
}
