import type { SerializedBoard } from "./serialized-board.js";

// How the player did so far in their game. Not used yet, kept for matchmaking.
export type GamePerformance = { wins: number; losses: number };

// A board a player sent when asking for an opponent, as it was at the end of their build phase. `playerId` is the
// logged-in player who sent it, absent for a guest's board and the seed boards.
export type PlayerBoard = { id: string; board: SerializedBoard; performance: GamePerformance; playerId?: string };
