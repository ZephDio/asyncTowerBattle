import { Army } from "../army/army";
import { Path } from "../path/domain/path";
import { Tower, TowerRecruit } from "../tower/domain/tower";
import { SoldierRecruit, Unit, UnitRecruit } from "../units/domain/units";
import { PhysicEntity } from "./physic";
import { TowerEntityPhysic } from "./tower/entity-tower-physic";
import { SoldierEntityUnitPhysic } from "./units/entity-units-physic";

export class Physics {
  units: PhysicEntity<UnitRecruit<Unit>>[] = [];
  alliedTowers: PhysicEntity<TowerRecruit<Tower>>[] = [];
  alliedPath: Path;
  enemyPath: Path;
  constructor(playerArtillery: Army, enemyArmy: Army) {
    this.enemyPath = enemyArmy.path;
    this.alliedPath = playerArtillery.path;
    this.alliedTowers = playerArtillery.towers.map(
      (clonedEntity) => new TowerEntityPhysic(clonedEntity)
    );
  }

  tick() {
    for (const unit of this.units) {
      unit.tick();
    }
  }
}
