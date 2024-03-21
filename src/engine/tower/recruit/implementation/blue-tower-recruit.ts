import { HitBox } from "../../../../shared/hitboxes";
import { getDistance, Position } from "../../../../shared/position";
import { BattleArmy } from "../../../army/battle/battle-army";
import { PhysicEntity, Recruit } from "../../../physic/physic";
import { BattleBulletProjectile } from "../../../projectile/battle/implementation/bullet-projectile-battle";
import { BattleRocketProjectile } from "../../../projectile/battle/implementation/rocket-projectile-bullet";
import { Rocket } from "../../../projectile/entity/implementation/rocket";
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

  getProjectile(onResolve: Function, target: PhysicEntity<Recruit>, position: Position, damage: number) {
    return new BattleRocketProjectile(this.tower.projectile, { x : position.x, y : position.y}, onResolve, target, damage)
  }
  matchesRule(enemyUnit: PhysicEntity<UnitRecruit<Unit>>) {
    return getDistance(enemyUnit.position, this.position) < 20;
  }

  toPhysic(addProjectile: BattleArmy["addProjectile"], removeProjectile: BattleArmy["removeProjectile"]): BlueBattleTower {
    return new BlueBattleTower(this.clone(), addProjectile, removeProjectile);
  }

  clone() {
    return new BlueTowerRecruit(
      { x: this.position.x, y: this.position.y },
      new BlueTower()
    );
  }
}
