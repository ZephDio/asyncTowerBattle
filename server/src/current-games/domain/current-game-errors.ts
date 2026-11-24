// A rule a CurrentGame breaks, so no CurrentGame is made. The board rules of its boards are the opponents module's own
// PlayerBoardRuleError.
export abstract class CurrentGameRuleError extends Error {}

export class InvalidLifeError extends CurrentGameRuleError {
	constructor(life: number) {
		super(`A running game has at least one life, got ${life}`);
	}
}

export class InvalidGoldError extends CurrentGameRuleError {
	constructor(gold: number) {
		super(`Gold is a count, got ${gold}`);
	}
}

export class InvalidSavedPerformanceError extends CurrentGameRuleError {
	constructor(performance: unknown) {
		super(`Wins and losses are counts, got ${JSON.stringify(performance)}`);
	}
}

export class MissingOpponentError extends CurrentGameRuleError {
	constructor() {
		super("A game saved in its battle phase holds the opponent it fights");
	}
}

export class UnexpectedOpponentError extends CurrentGameRuleError {
	constructor() {
		super("A game saved in its shop phase holds no opponent");
	}
}

export class OpponentRoundError extends CurrentGameRuleError {
	constructor(round: number, opponentRound: number) {
		super(`The opponent of a round ${round} battle is a board of round ${round}, got round ${opponentRound}`);
	}
}
