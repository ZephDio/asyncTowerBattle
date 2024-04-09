import { Army } from "../army/army";

export abstract class MatchMaker {
  abstract getOpponent(round : number): Army
}