import { Position } from "../../shared/position";
import { BattleArmy } from "../army/battle-army";
import { Path } from "../path/domain/path";
import { BattleCastle } from "../physic/castle/battle-castle";
import { Unit, UnitRecruit } from "../units/domain/units";

export class UnitProduction<U extends Unit> {
  progress = 0;
  constructor(
    public barrack: BattleBarrack<UnitRecruit<U>>,
    public resolve: Function
  ) { }

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
    public path: Path,
    public addRecruit: BattleArmy["addUnit"],

    public recruit: U
  ) { }

  abstract tick(): void
}
