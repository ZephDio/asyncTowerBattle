export class NoOpponentError extends Error {
	constructor(round: number) {
		super(`No opponent board for round ${round}`);
	}
}
