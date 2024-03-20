import { HitBox } from "../../../../shared/hitboxes";
import { getDistance, Position } from "../../../../shared/position";
import { PhysicEntity } from "../../../physic/physic";
import { Unit } from "../../../units/entity/units";
import { UnitRecruit } from "../../../units/recruit/unit-recruit";
import { GreenBattleTower } from "../../battle/implementation/battle.green.tower";
import { GreenTower } from "../../entity/implementation/green-tower";
import { TowerRecruit } from "../tower-recruit";

export class GreenTowerRecruit extends TowerRecruit<GreenTower> {
  attackDamage = 10;
  attackSpeed = 3;
  type = "green" as const;
  hitbox: HitBox;

  constructor(public position: Position, public tower: GreenTower) {
    super();
    this.hitbox = tower.hitbox;
  }
  matchesRule(enemyUnit: PhysicEntity<UnitRecruit<Unit>>) {
    return (
      enemyUnit.isAlive() && getDistance(enemyUnit.position, this.position) < 10
    );
  }

  toPhysic(): GreenBattleTower {
    return new GreenBattleTower(this.clone());
  }

  clone() {
    return new GreenTowerRecruit(
      { x: this.position.x, y: this.position.y },
      new GreenTower()
    );
  }
}
