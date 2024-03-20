import { HitBox } from "../../../../shared/hitboxes";
import { getDistance, Position } from "../../../../shared/position";
import { PhysicEntity } from "../../../physic/physic";
import { Unit } from "../../../units/entity/units";
import { UnitRecruit } from "../../../units/recruit/unit-recruit";
import { BlueBattleTower } from "../../battle/implementation/battle-blue-tower";
import { BlueTower } from "../../entity/implementation/blue-tower";
import { TowerRecruit } from "../tower-recruit";

export class BlueTowerRecruit extends TowerRecruit<BlueTower> {
  attackDamage = 6;
  attackSpeed = 3;
  type = "blue" as const;
  hitbox: HitBox;

  constructor(public position: Position, public tower: BlueTower) {
    super();
    this.hitbox = tower.hitbox;
  }
  matchesRule(enemyUnit: PhysicEntity<UnitRecruit<Unit>>) {
    return getDistance(enemyUnit.position, this.position) < 20;
  }

  toPhysic(): BlueBattleTower {
    return new BlueBattleTower(this.clone());
  }

  clone() {
    return new BlueTowerRecruit(
      { x: this.position.x, y: this.position.y },
      new BlueTower()
    );
  }
}
