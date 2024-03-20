import { HitBox } from "../../../../shared/hitboxes";
import { getDistance, Position } from "../../../../shared/position";
import { PhysicEntity } from "../../../physic/physic";
import { Unit } from "../../../units/entity/units";
import { UnitRecruit } from "../../../units/recruit/unit-recruit";
import { OrangeBattleTower } from "../../battle/implementation/battle-orange-tower";
import { OrangeTower } from "../../entity/implementation/orange-tower";
import { TowerRecruit } from "../tower-recruit";

export class OrangeTowerRecruit extends TowerRecruit<OrangeTower> {
  attackDamage = 6;
  attackSpeed = 3;
  type = "orange" as const;
  hitbox: HitBox;

  constructor(public position: Position, public tower: OrangeTower) {
    super();
    this.hitbox = tower.hitbox;
  }

  matchesRule(enemyUnit: PhysicEntity<UnitRecruit<Unit>>) {
    return getDistance(enemyUnit.position, this.position) < 35;
  }

  toPhysic(): OrangeBattleTower {
    return new OrangeBattleTower(this.clone());
  }

  clone() {
    return new OrangeTowerRecruit(
      { x: this.position.x, y: this.position.y },
      new OrangeTower()
    );
  }
}
