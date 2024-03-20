import { Army } from "../army/army";
import { BattleArmy } from "../army/battle-army";
import { Path } from "../path/domain/path";
import { Tower, TowerRecruit } from "../tower/domain/tower";
import { SoldierRecruit, Unit, UnitRecruit } from "../units/domain/units";
import { PhysicEntity, Recruit } from "./physic";
import { BattleTower } from "./tower/entity-tower-physic";

export class Physics {
  units: PhysicEntity<UnitRecruit<Unit>>[] = [];
  alliedTowers: PhysicEntity<TowerRecruit<Tower>>[] = [];
  alliedPath: Path;
  enemyPath: Path;
  constructor(playerArtillery: BattleArmy, enemyArmy: BattleArmy) {
    this.enemyPath = enemyArmy.path;
    this.alliedPath = playerArtillery.path;
    this.alliedTowers = playerArtillery.towers;
  }

  tick() {
    for (const unit of this.units) {
      unit.tick();
    }
  }
}
