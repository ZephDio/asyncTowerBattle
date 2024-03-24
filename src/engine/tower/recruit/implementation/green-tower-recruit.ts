import { HitBox } from "../../../../shared/hitboxes";
import { Position } from "../../../../shared/position";
import { BattleArmy } from "../../../army/battle/battle-army";
import { PhysicEntity, Recruit } from "../../../../shared/physic";
import { BattleBulletProjectile } from "../../../projectile/battle/implementation/bullet-projectile-battle";
import { GreenBattleTower } from "../../battle/implementation/battle.green.tower";
import { GreenTower } from "../../entity/implementation/green-tower";
import { TowerRecruit } from "../tower-recruit";
import { SearchTarget } from "../../../battle/battlefield/battlefield";

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
    return new BattleBulletProjectile(this.tower.projectile, { x: position.x, y: position.y }, onResolve, target, damage);
  }

  toPhysic(addProjectile: BattleArmy["addProjectile"], removeProjectile: BattleArmy["removeProjectile"], searchTarget: SearchTarget): GreenBattleTower {
    return new GreenBattleTower(this.clone(), addProjectile, removeProjectile, searchTarget);
  }

  clone() {
    return new GreenTowerRecruit({ x: this.position.x, y: this.position.y }, new GreenTower());
  }
}
