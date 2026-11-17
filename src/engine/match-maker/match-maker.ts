import { Army } from "../army/army";

export type Opponent = { army: Army; randomSeed: number };

export abstract class MatchMaker {
	abstract getOpponent(round: number): Promise<Opponent>;
}
