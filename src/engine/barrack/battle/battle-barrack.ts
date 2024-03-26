import { Position } from "../../../shared/position";
import { BattleArmy } from "../../army/battle/battle-army";
import { ArmyPath, BattlePath } from "../../path/entity/path";
import { BattleCastle } from "../../castle/battle/battle-castle";
import { Unit } from "../../units/entity/units";
import { UnitRecruit } from "../../units/recruit/unit-recruit";

export class UnitProduction<U extends Unit> {
  progress = 0;
  constructor(public barrack: BattleBarrack<UnitRecruit<U>>, public resolve: Function) {}

  tick() {
    this.progress += this.barrack.productionSpeed;
    if (this.progress >= 100) {
      this.resolve();
    }
  }
}

export abstract class BattleBarrack<U extends UnitRecruit<Unit>> {
  constructor(
    public targetCastle: BattleCastle,
    public productionSpeed: number,
    public position: Position,
    public path: BattlePath,
    public addRecruit: BattleArmy["addUnit"],

    public recruit: U
  ) {}

  abstract tick(): void;
}
