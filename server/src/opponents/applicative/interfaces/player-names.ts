// Output port of the opponent use cases: the names of the players who built the boards. Abstract so it can be used as
// the injection token.
export abstract class PlayerNames {
	// Undefined when no player has this id, such as one who deleted their account.
	abstract find(playerId: string): Promise<string | undefined>;
}
