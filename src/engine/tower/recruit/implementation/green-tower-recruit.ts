import { HitBox } from "../../../../shared/hitboxes";
import { GridPosition, Position } from "../../../../shared/position";
import { BattleArmy, BattleArmyHooks } from "../../../army/battle/battle-army";
import { Physic, PhysicEntity, Recruit } from "../../../../shared/physic";
import { BattleBulletProjectile } from "../../../projectile/battle/implementation/bullet-projectile-battle";
import { GreenBattleTower } from "../../battle/implementation/battle.green.tower";
import { GreenTower } from "../../entity/implementation/green-tower";
import { TowerRecruit } from "../tower-recruit";
import { SearchTarget } from "../../../battle/battlefield/battlefield";
import { BattleTower } from "../../battle/battle-tower";
import { BattleGrid } from "../../../grid/battle-grid";

export class GreenTowerRecruit extends TowerRecruit<GreenTower> {
  attackDamage = 10;
  attackSpeed = 3;
  type = "green" as const;
  hitbox: HitBox;

  constructor(public tower: GreenTower, public gridPosition: GridPosition) {
    super();
    this.hitbox = tower.hitbox;
  }

  getProjectile(hooks: BattleArmyHooks, target: PhysicEntity<Recruit>, position: Position, damage: number) {
    return new BattleBulletProjectile(this.tower.projectile, { x: position.x, y: position.y }, hooks, target, damage);
  }

  toAllied(grid: BattleGrid, hooks: BattleArmyHooks): BattleTower<TowerRecruit<GreenTower>> {
    const clone = this.clone()
    const position =grid.gridPositionToReal(clone.gridPosition) 
    return new GreenBattleTower(clone, position, clone.gridPosition, hooks);
  }

  toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): BattleTower<TowerRecruit<GreenTower>> {
    const clone = this.clone()
    const gridPosition = BattleGrid.flip(grid,clone.gridPosition)
    const position = grid.gridPositionToReal(gridPosition) 
    return new GreenBattleTower(clone, position,gridPosition, hooks);
  }


  clone() {
    return new GreenTowerRecruit(new GreenTower(), { gridX: this.gridPosition.gridX, gridY: this.gridPosition.gridY });
  }
}
