import { Position } from "../../shared/position";
import { BattleArmy } from "../army/battle-army";
import { Path } from "../path/domain/path";
import { BattleCastle } from "../physic/castle/entity-castle-physic";
import { PhysicEntity, Recruit } from "../physic/physic";
import { SoldierRecruitPhysic } from "../physic/units/entity-units-physic";
import { SoldierRecruit, Unit, UnitRecruit } from "../units/domain/units";

export class UnitProduction<U extends Unit> {
  progress = 0;
  constructor(
    public barrack: BattleBarrack<UnitRecruit<U>>,
    public resolve: Function
  ) {}

  tick() {
    this.progress += this.barrack.productionSpeed;
    console.log({ progress: this.progress });
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
  ) {}
}
