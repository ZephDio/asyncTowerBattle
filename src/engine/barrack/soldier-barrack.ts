import { Position } from "../../shared/position";
import { BattleArmy } from "../army/battle-army";
import { Path } from "../path/domain/path";
import { BattleCastle } from "../physic/castle/battle-castle";
import { SoldierRecruitPhysic } from "../physic/units/entity-units-physic";
import { Soldier, SoldierRecruit, UnitEntityFixture } from "../units/domain/units";
import { Barrack } from "./barrack";
import { BattleBarrack, UnitProduction } from "./battle-barrack";

export class SoldierBarrack extends Barrack<Soldier> {
  type = "soldier" as const;
  constructor(public unitRecruit: SoldierRecruit, public productionSpeed: number = 2) {
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
    public removeRecruit: BattleArmy["removeUnit"],

    public recruit: SoldierRecruit
  ) { }

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
    this.addRecruit(new SoldierRecruitPhysic(this.recruit, this.position, this.path, this.targetCastle, this.removeRecruit), this)
  }
}

export const BarracksFixture = {
  soldier: (speed?: number) => new SoldierBarrack(UnitEntityFixture.soldier, speed)
}
