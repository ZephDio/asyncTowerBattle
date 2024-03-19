import { Position } from "../../shared/position";
import { Battle } from "../battle/battle";
import { PhysicEntity } from "../physic/physic";
import { SoldierEntityUnitPhysic } from "../physic/units/entity-units-physic";
import { SoldierRecruit, Unit } from "../units/domain/units";

export class UnitProduction<U extends Unit> {
  progress = 0;
  constructor(public barrack: Barrack, public resolve: Function) {}

  tick() {
    this.progress += this.barrack.productionSpeed;
    console.log({ progress: this.progress });
    if (this.progress >= 100) {
      this.resolve();
    }
  }
}

export class Barrack {
  onGoingProduction = null as null | UnitProduction<Unit>;
  constructor(
    public productionSpeed: number,
    public team: "allied" | "enemy",
    public position: Position,
    private battle: Battle,
    public soldierEntityUnit: SoldierRecruit
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
    const castleTarget =
      this.team == "allied"
        ? this.battle.enemyArmy.path
        : this.battle.alliedArmy.path;
    this.battle.physics.units.push(
      new SoldierEntityUnitPhysic(
        this.soldierEntityUnit,
        this.position,
        castleTarget
      )
    );
  }
}
