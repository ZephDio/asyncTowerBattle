import type { PlayerBoard } from "../../domain/player-board.js";

export type StoredPlayerBoard = PlayerBoard & { id: string };

// Output port of the opponent use cases: the boards still available as opponents. Abstract so it can be used as the
// injection token.
export abstract class OpponentBoardStore {
	abstract add(playerBoard: PlayerBoard): void;
	abstract findByRound(round: number): StoredPlayerBoard[];
	abstract remove(id: string): void;
	// Every round that has at least one board.
	abstract rounds(): number[];
}
