import { HitBox } from "../../../../shared/hitboxes";
import { GridPosition, Position } from "../../../../shared/position";
import { BattleArmy, BattleArmyHooks } from "../../../army/battle/battle-army";
import { PhysicEntity, Recruit } from "../../../../shared/physic";
import { BattleBulletProjectile } from "../../../projectile/battle/implementation/bullet-projectile-battle";
import { OrangeBattleTower } from "../../battle/implementation/battle-orange-tower";
import { OrangeTower } from "../../entity/implementation/orange-tower";
import { TowerRecruit } from "../tower-recruit";
import { BattleGrid } from "../../../grid/battle-grid";
import { BattleTower } from "../../battle/battle-tower";

export class OrangeTowerRecruit extends TowerRecruit<OrangeTower> {
  attackDamage = 10;
  attackSpeed = 3;
  type = "orange" as const;
  hitbox: HitBox;

  constructor(public tower: OrangeTower, public gridPosition: GridPosition) {
    super();
    this.hitbox = tower.hitbox;
  }

  getProjectile(hooks: BattleArmyHooks, target: PhysicEntity<Recruit>, position: Position, damage: number) {
    return new BattleBulletProjectile(this.tower.projectile, { x: position.x, y: position.y }, hooks, target, damage);
  }

  toAllied(grid: BattleGrid, hooks: BattleArmyHooks): BattleTower<TowerRecruit<OrangeTower>> {
    const clone = this.clone()
    const position =grid.gridPositionToReal(clone.gridPosition) 
    return new OrangeBattleTower(clone, position, clone.gridPosition, hooks);
  }

  toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): BattleTower<TowerRecruit<OrangeTower>> {
    const clone = this.clone()
    const gridPosition = BattleGrid.flip(grid,clone.gridPosition)
    const position = grid.gridPositionToReal(gridPosition) 
    return new OrangeBattleTower(clone, position,gridPosition, hooks);
  }

  clone() {
    return new OrangeTowerRecruit(new OrangeTower(), { gridX: this.gridPosition.gridX, gridY: this.gridPosition.gridY });
  }
}
