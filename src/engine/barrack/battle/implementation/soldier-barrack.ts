import { Position } from "../../../../shared/position";
import { BattleArmy } from "../../../army/battle/battle-army";
import { Path } from "../../../path/entity/path";
import { BattleCastle } from "../../../castle/battle/battle-castle";
import { BattleBarrack, UnitProduction } from "../battle-barrack";
import { SoldierRecruit } from "../../../units/recruit/implementation/soldier-recruit";
import { Soldier } from "../../../units/entity/implementation/soldier";
import { SoldierRecruitPhysic } from "../../../units/battle/implementation/soldier-battle";

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
    this.addRecruit(
      new SoldierRecruitPhysic(
        this.recruit,
        {x : this.position.x , y : this.position.y},
        this.path,
        this.targetCastle,
        this.removeRecruit
      ),
      this
    );
  }
}
