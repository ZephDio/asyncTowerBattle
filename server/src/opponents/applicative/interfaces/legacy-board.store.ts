import type { PlayerBoard } from "../../domain/player-board.js";

// A board pulled as an opponent, with the id of the board its puller sent in the same request.
export type LegacyPlayerBoard = PlayerBoard & { pulledBy: string };

// Output port of the opponent use cases: where boards go once they were pulled as an opponent.
export abstract class LegacyBoardStore {
	abstract add(playerBoard: LegacyPlayerBoard): Promise<void>;
}
