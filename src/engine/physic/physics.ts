import { Army } from "../army/army";
import { Path } from "../path/domain/path";
import { Tower, TowerEntity } from "../tower/domain/tower";
import { SoldierEntityUnit, Unit, UnitEntity } from "../units/domain/units";
import { Physic } from "./physic";
import { TowerEntityPhysic } from "./tower/entity-tower-physic";
import { SoldierEntityUnitPhysic } from "./units/entity-units-physic";

export class Physics {
  units: Physic<UnitEntity<Unit>>[] = [];
  alliedTowers: Physic<TowerEntity<Tower>>[] = []
  alliedPath: Path
  enemyPath: Path
  constructor(playerArtillery: Army, enemyArmy: Army) {
    this.enemyPath = enemyArmy.path
    this.alliedPath = playerArtillery.path
    this.alliedTowers = playerArtillery.towers.map((clonedEntity) => new TowerEntityPhysic(clonedEntity))
  }

  tick() {
    for (const unit of this.units) {
      unit.tick();
    }
  }
}
