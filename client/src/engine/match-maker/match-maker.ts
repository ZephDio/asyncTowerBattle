import { Army } from "../army/army";

export type Opponent = { army: Army; randomSeed: number };

// How the player did so far in the game. Keep in sync with server/src/opponents/domain/player-board.ts.
export type GamePerformance = { wins: number; losses: number };

export abstract class MatchMaker {
	// The player's army is their board of the round, which a remote match maker hands to the next players.
	abstract getOpponent(round: number, army: Army, performance: GamePerformance): Promise<Opponent>;
}
