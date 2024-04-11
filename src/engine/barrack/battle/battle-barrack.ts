import { BasicBattleBarrack } from "./implementation/basic-battle-barrack";
import { VeterantBattleBarrack } from "./implementation/veterant-battle-barrack";
import { WaveBattleBarrack } from "./implementation/wave-battle-barrack";

export type AnyBattleBarrack = BasicBattleBarrack | WaveBattleBarrack | VeterantBattleBarrack;
