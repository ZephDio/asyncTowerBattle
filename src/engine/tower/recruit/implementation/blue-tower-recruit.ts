import { HitBox } from "../../../../shared/hitboxes";
import { Cell, Position } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattleRocketProjectile } from "../../../projectile/battle/implementation/battle-rocket";
import { BlueBattleTower } from "../../battle/implementation/battle-blue-tower";
import { BlueTower } from "../../entity/implementation/blue-tower";
import { TowerRecruit } from "../tower-recruit";
import { BattleGrid } from "../../../grid/battle-grid";
import { AnyBattleTower } from "../../battle/battle-tower";
import { Derive } from "@ddd-ts/traits";
import { TDrawable, TRenderable } from "../../../../shared/traits/drawable";
import { Resources } from "../../../../renderer/resources";
import { AnyBattleUnit } from "../../../units/recruit/unit-recruit";
import { GridElement } from "../../../grid/grid";

export class BlueTowerRecruit extends Derive(TowerRecruit,TDrawable, TRenderable) {
  isPatternActivated: (gridElement: GridElement | undefined) => boolean;
  patternEffect: Cell[];
  attackDamage = 7;
  attackSpeed = 1.2;
  hitbox: HitBox;

  constructor(public tower: BlueTower, public cell: Cell) {
    super({});
    this.hitbox = tower.hitbox;
    this.patternEffect = tower.patternEffect;
    this.isPatternActivated = tower.isPatternActivated;
  }

  getProjectile(hooks: BattleArmyHooks, target: AnyBattleUnit, position: Position, damage: number) {
    return new BattleRocketProjectile(this.tower.projectile, position.clone(), hooks, target, damage);
  }

  toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
    const clone = this.clone();
    const position = grid.cellToReal(clone.cell);
    return new BlueBattleTower(clone, hooks, position, clone.cell);
  }

  toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
    const clone = this.clone();
    const cell = BattleGrid.flip(grid, clone.cell);
    const position = grid.cellToReal(cell);
    return new BlueBattleTower(clone, hooks, position, cell);
  }

  clone() {
    return new BlueTowerRecruit(new BlueTower({}), new Cell({ x: this.cell.x, y: this.cell.y }));
  }

  get position(): Cell {
    return this.cell;
  }
  
  drawPriority= 3;
  draw(context: CanvasRenderingContext2D, position: Position): void {
    const image = Resources.tower.blue.resource.image;
    const canvasPosition = this.getCanvasPosition(context, position);
    const { width, height } = Resources.tower.green.size;
    const size = this.getCanvasSize(context, width, height);
    this.drawImage(context, size, canvasPosition, image);
  }
}
