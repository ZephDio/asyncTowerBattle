import type { StoredPlayerBoard } from "./opponent-board.store.js";

// Output port of the opponent use cases: where boards go once they were pulled as an opponent.
export abstract class LegacyBoardStore {
	abstract add(playerBoard: StoredPlayerBoard): Promise<void>;
}
