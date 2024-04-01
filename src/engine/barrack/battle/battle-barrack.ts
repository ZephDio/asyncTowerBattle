import { BasicBattleBarrack } from "./implementation/basic-battle-barrack";

export type AnyBattleBarrack = BasicBattleBarrack;

// export abstract class BattleBarrack<BR extends BarrackRecruit> {
//   constructor(
//     public barrackRecruit: BR,
//     public productionSpeed: number,
//     public position: Position,
//     public path: BattlePath,
//     public recruit: ImplementsTrait<typeof UnitRecruit>,
//     public hooks: BattleArmyHooks
//   ) {}

//   abstract tick(): void;
// }
