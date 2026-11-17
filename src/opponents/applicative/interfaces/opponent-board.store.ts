import type { SerializedBoard } from "../../domain/serialized-board.js";

// Output port of the opponent use cases: where boards are kept. Abstract so it can be used as the injection token.
export abstract class OpponentBoardStore {
	abstract add(board: SerializedBoard): void;
	abstract findByRound(round: number): SerializedBoard[];
	// Every round that has at least one board.
	abstract rounds(): number[];
}
