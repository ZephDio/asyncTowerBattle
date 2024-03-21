import { HitBox } from "../../../../shared/hitboxes";
import { getDistance, Position } from "../../../../shared/position";
import { BattleArmy } from "../../../army/battle/battle-army";
import { PhysicEntity, Recruit } from "../../../physic/physic";
import { BattleBulletProjectile } from "../../../projectile/battle/implementation/bullet-projectile-battle";
import { Bullet } from "../../../projectile/entity/implementation/bullet";
import { Unit } from "../../../units/entity/units";
import { UnitRecruit } from "../../../units/recruit/unit-recruit";
import { GreenBattleTower } from "../../battle/implementation/battle.green.tower";
import { GreenTower } from "../../entity/implementation/green-tower";
import { OrangeTower } from "../../entity/implementation/orange-tower";
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

  getProjectile(onResolve: Function, target: PhysicEntity<Recruit>, position: Position, damage: number) {
    return new BattleBulletProjectile(this.tower.projectile, {x : position.x, y : position.y}, onResolve, target, damage)
  }

  matchesRule(enemyUnit: PhysicEntity<UnitRecruit<Unit>>) {
    return (
      enemyUnit.isAlive() && getDistance(enemyUnit.position, this.position) < 10
    );
  }

  toPhysic(addProjectile: BattleArmy["addProjectile"], removeProjectile: BattleArmy["removeProjectile"]): GreenBattleTower {
    return new GreenBattleTower(this.clone(), addProjectile, removeProjectile);
  }

  clone() {
    return new GreenTowerRecruit(
      { x: this.position.x, y: this.position.y },
      new GreenTower()
    );
  }
}
