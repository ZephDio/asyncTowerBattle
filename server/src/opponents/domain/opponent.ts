import type { SerializedBoard } from "./serialized-board.js";

// The board a player fights, with the name of the player who built it. A seed board has no player, so no name.
export type Opponent = { board: SerializedBoard; playerName?: string };
