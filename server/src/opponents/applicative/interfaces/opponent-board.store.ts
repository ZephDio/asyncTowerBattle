import type { PlayerBoard } from "../../domain/player-board.js";

// Output port of the opponent use cases: the boards still available as opponents. Abstract so it can be used as the
// injection token.
export abstract class OpponentBoardStore {
	abstract add(playerBoard: PlayerBoard): Promise<void>;
	// How many boards of the round are available, whoever built them.
	abstract count(round: number): Promise<number>;
	// One board of the round picked at random, leaving out those of `notOwnedBy` when it is given. Undefined when the
	// round has none.
	abstract pickOne(round: number, notOwnedBy?: string): Promise<PlayerBoard | undefined>;
	// Adds `pulledBy` to the boards that pulled the board, which stays available. Recorded even if the board was removed.
	abstract markPulled(id: string, pulledBy: string): Promise<void>;
	// Takes the board out of the available ones, as the opponent of the board `pulledBy`. The board is kept with every
	// board that pulled it: removing it again, even concurrently, only records the new puller.
	abstract remove(id: string, pulledBy: string): Promise<void>;
}
