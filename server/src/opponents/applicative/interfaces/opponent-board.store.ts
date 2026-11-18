import type { PlayerBoard } from "../../domain/player-board.js";

// Output port of the opponent use cases: the boards still available as opponents. Abstract so it can be used as the
// injection token.
export abstract class OpponentBoardStore {
	abstract add(playerBoard: PlayerBoard): Promise<void>;
	// How many boards of the round are available, whoever built them.
	abstract count(round: number): Promise<number>;
	// The boards of the round, leaving out those of `notOwnedBy` when it is given.
	abstract findByRound(round: number, notOwnedBy?: string): Promise<PlayerBoard[]>;
	// Adds `pulledBy` to the boards that pulled the board, which stays available.
	abstract markPulled(id: string, pulledBy: string): Promise<void>;
	// Takes the board out of the available ones, as the opponent of the board `pulledBy`.
	abstract remove(id: string, pulledBy: string): Promise<void>;
	// Every round that has at least one board, leaving out those of `notOwnedBy` when it is given.
	abstract rounds(notOwnedBy?: string): Promise<number[]>;
}
