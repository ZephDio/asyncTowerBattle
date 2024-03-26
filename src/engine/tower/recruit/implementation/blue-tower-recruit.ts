import { HitBox } from "../../../../shared/hitboxes";
import { GridPosition, Position } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { PhysicEntity, Recruit } from "../../../../shared/physic";
import { BattleRocketProjectile } from "../../../projectile/battle/implementation/rocket-projectile-bullet";
import { BlueBattleTower } from "../../battle/implementation/battle-blue-tower";
import { BlueTower } from "../../entity/implementation/blue-tower";
import { TowerRecruit } from "../tower-recruit";

export class BlueTowerRecruit extends TowerRecruit<BlueTower> {
  attackDamage = 7;
  attackSpeed = 1.2;
  type = "blue" as const;
  hitbox: HitBox;

  constructor(public tower: BlueTower, public gridPosition: GridPosition) {
    super();
    this.hitbox = tower.hitbox;
  }

  getProjectile(hooks: BattleArmyHooks, target: PhysicEntity<Recruit>, position: Position, damage: number) {
    return new BattleRocketProjectile(this.tower.projectile, { x: position.x, y: position.y }, hooks, target, damage);
  }


  toPhysic(position: Position, hooks: BattleArmyHooks): BlueBattleTower {
    return new BlueBattleTower(this.clone(), position, hooks);
  }


  clone() {
    return new BlueTowerRecruit(new BlueTower(), { gridX: this.gridPosition.gridX, gridY: this.gridPosition.gridY });
  }
}
