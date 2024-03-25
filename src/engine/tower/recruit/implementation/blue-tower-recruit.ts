import { HitBox } from "../../../../shared/hitboxes";
import { Position } from "../../../../shared/position";
import { BattleArmy, BattleArmyHooks } from "../../../army/battle/battle-army";
import { Physic, PhysicEntity, Recruit } from "../../../../shared/physic";
import { BattleRocketProjectile } from "../../../projectile/battle/implementation/rocket-projectile-bullet";
import { BlueBattleTower } from "../../battle/implementation/battle-blue-tower";
import { BlueTower } from "../../entity/implementation/blue-tower";
import { TowerRecruit } from "../tower-recruit";
import { SearchTarget } from "../../../battle/battlefield/battlefield";

export class BlueTowerRecruit extends TowerRecruit<BlueTower> {
  attackDamage = 7;
  attackSpeed = 1.2;
  type = "blue" as const;
  hitbox: HitBox;

  constructor(public position: Position, public tower: BlueTower) {
    super();
    this.hitbox = tower.hitbox;
  }

  getProjectile(hooks: BattleArmyHooks, target: PhysicEntity<Recruit>, position: Position, damage: number) {
    return new BattleRocketProjectile(this.tower.projectile, { x: position.x, y: position.y }, hooks, target, damage);
  }


  toPhysic(hooks: BattleArmyHooks): BlueBattleTower {
    return new BlueBattleTower(this.clone(), hooks);
  }


  clone() {
    return new BlueTowerRecruit({ x: this.position.x, y: this.position.y }, new BlueTower());
  }
}
