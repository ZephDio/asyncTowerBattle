import type { PlayerBoard } from "../../domain/player-board.js";

// Output port of the opponent use cases: where boards go once a pull consumed them, with every board that pulled them.
export abstract class LegacyBoardStore {
	abstract add(playerBoard: PlayerBoard): Promise<void>;
}
