export class NoOpponentError extends Error {
	constructor(round: number) {
		super(`No opponent board for round ${round}`);
	}
}

export class BoardRoundMismatchError extends Error {
	constructor(round: number, boardRound: number) {
		super(`Asked for an opponent of round ${round} with a board of round ${boardRound}`);
	}
}
