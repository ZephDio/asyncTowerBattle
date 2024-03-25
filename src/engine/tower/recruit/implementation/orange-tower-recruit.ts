import { HitBox } from "../../../../shared/hitboxes";
import { Position } from "../../../../shared/position";
import { BattleArmy, BattleArmyHooks } from "../../../army/battle/battle-army";
import { PhysicEntity, Recruit } from "../../../../shared/physic";
import { BattleBulletProjectile } from "../../../projectile/battle/implementation/bullet-projectile-battle";
import { OrangeBattleTower } from "../../battle/implementation/battle-orange-tower";
import { OrangeTower } from "../../entity/implementation/orange-tower";
import { TowerRecruit } from "../tower-recruit";
import { SearchTarget } from "../../../battle/battlefield/battlefield";

export class OrangeTowerRecruit extends TowerRecruit<OrangeTower> {
  attackDamage = 10;
  attackSpeed = 3;
  type = "orange" as const;
  hitbox: HitBox;

  constructor(public position: Position, public tower: OrangeTower) {
    super();
    this.hitbox = tower.hitbox;
  }

  getProjectile(hooks: BattleArmyHooks, target: PhysicEntity<Recruit>, position: Position, damage: number) {
    return new BattleBulletProjectile(this.tower.projectile, { x: position.x, y: position.y }, hooks, target, damage);
  }

  toPhysic(hooks: BattleArmyHooks): OrangeBattleTower {
    return new OrangeBattleTower(this.clone(), hooks);
  }

  clone() {
    return new OrangeTowerRecruit({ x: this.position.x, y: this.position.y }, new OrangeTower());
  }
}
