import { HitBox } from "../../../../shared/hitboxes";
import { getDistance, Position } from "../../../../shared/position";
import { BattleArmy } from "../../../army/battle/battle-army";
import { PhysicEntity, Recruit } from "../../../physic/physic";
import { BattleBulletProjectile } from "../../../projectile/battle/implementation/bullet-projectile-battle";
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

  getProjectile(onResolve: Function, target: PhysicEntity<Recruit>, position: Position, damage: number) {
    return new BattleBulletProjectile(this.tower.projectile,  {x : position.x, y : position.y}, onResolve, target, damage)
  }

  matchesRule(enemyUnit: PhysicEntity<UnitRecruit<Unit>>) {
    return getDistance(enemyUnit.position, this.position) < 35;
  }

  toPhysic(addProjectile: BattleArmy["addProjectile"], removeProjectile: BattleArmy["removeProjectile"]): OrangeBattleTower {
    return new OrangeBattleTower(this.clone(), addProjectile, removeProjectile);
  }

  clone() {
    return new OrangeTowerRecruit(
      { x: this.position.x, y: this.position.y },
      new OrangeTower()
    );
  }
}
