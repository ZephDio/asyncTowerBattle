import type { CheckedBoard } from "./checked-board.js";

// How the player did so far in their game. Not used yet, kept for matchmaking.
export type GamePerformance = { wins: number; losses: number };

// A board a player sent when asking for an opponent, as it was at the end of their build phase. `playerId` is the
// logged-in player who sent it, absent for a guest's board and the bot boards. `bot` marks a board no player built, such
// as the seed boards. `pulledBy` lists the boards whose players pulled it as their opponent, oldest first.
export type PlayerBoard = {
	id: string;
	board: CheckedBoard;
	performance: GamePerformance;
	playerId?: string;
	bot: boolean;
	pulledBy: string[];
};
