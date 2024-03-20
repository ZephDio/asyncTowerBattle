import { Position } from "../../shared/position";
import { BattleArmy } from "../army/battle-army";
import { Path } from "../path/domain/path";
import { BattleCastle } from "../physic/castle/entity-castle-physic";
import { Soldier, SoldierRecruit, Unit } from "../units/domain/units";
import { Barrack } from "./barrack";
import { BattleBarrack, UnitProduction } from "./battle-barrack";

export class SoldierBarrack extends Barrack<Soldier> {
  type = "soldier" as const;
  public productionSpeed = 2;
  constructor(public unitRecruit: SoldierRecruit) {
    super();
  }

  toBattle(...args: ConstructorParameters<typeof SoldierBattleBarrack>) {
    return new SoldierBattleBarrack(...args);
  }
}

export class SoldierBattleBarrack implements BattleBarrack<SoldierRecruit> {
  onGoingProduction = null as null | UnitProduction<Soldier>;

  constructor(
    public productionSpeed: number,
    public position: Position,
    public path: Path,
    public targetCastle: BattleCastle,
    public addRecruit: BattleArmy["addUnit"],

    public recruit: SoldierRecruit
  ) {}

  tick() {
    if (this.onGoingProduction) {
      this.onGoingProduction.tick();
    }
    if (!this.onGoingProduction) {
      this.onGoingProduction = new UnitProduction(this, () => {
        this.produce();
        this.onGoingProduction = null;
      });
    }
  }

  produce() {
    const castleTarget = this.targetCastle;
  }
}
