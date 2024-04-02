import { HitBox } from "../../../../shared/hitboxes";
import { Cell, Position } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { TowerRecruit } from "../tower-recruit";
import { AnyBattleTower } from "../../battle/battle-tower";
import { BattleGrid } from "../../../grid/battle-grid";
import { Derive } from "@ddd-ts/traits";
import { TDrawable, TRenderable } from "../../../../shared/traits/drawable";
import { Resources } from "../../../../renderer/resources";
import { YellowTower } from "../../entity/implementation/yellow-tower";
import { YellowBattleTower } from "../../battle/implementation/battle-yellow-tower";
import { PoisonGround } from "../../../area-effect/implementation/poison-ground";
import { GridElement } from "../../../grid/grid";

export class YellowTowerRecruit extends Derive(TowerRecruit, TDrawable, TRenderable) {
  isPatternActivated: (gridElement: GridElement | undefined) => boolean;
  patternEffect: Cell[];
  attackDamage = 10;
  attackSpeed = 0.8;
  type = "yellow" as const;
  hitbox: HitBox;

  constructor(public tower: YellowTower, public cell: Cell) {
    super({});
    this.hitbox = tower.hitbox;
    this.patternEffect = tower.patternEffect;
    this.isPatternActivated = tower.isPatternActivated;
  }

  getAreaEffect(hooks: BattleArmyHooks, position: Position, damage: number) {
    return new PoisonGround(80,position, damage,hooks);
  }

  toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
    const clone = this.clone();
    const position = grid.cellToReal(clone.cell);
    return new YellowBattleTower(clone, hooks, position, clone.cell);
  }

  toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
    const clone = this.clone();
    const cell = BattleGrid.flip(grid, clone.cell);
    const position = grid.cellToReal(cell);
    return new YellowBattleTower(clone, hooks, position, cell);
  }

  clone() {
    return new YellowTowerRecruit(new YellowTower({}), this.cell);
  }

  get position(): Cell {
    return this.cell;
  }

  drawPriority = 3;
  draw(context: CanvasRenderingContext2D, position: Position): void {
    const image = Resources.tower.yellow.resource.image;
    const canvasPosition = this.getCanvasPosition(context, position);
    const { width, height } = Resources.tower.green.size;
    const size = this.getCanvasSize(context, width, height);
    this.drawImage(context, size, canvasPosition, image);
  }
}
