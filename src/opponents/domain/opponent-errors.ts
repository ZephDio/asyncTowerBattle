export class InvalidRoundError extends Error {
	constructor(round: number) {
		super(`Rounds start at 1, got ${round}`);
	}
}
