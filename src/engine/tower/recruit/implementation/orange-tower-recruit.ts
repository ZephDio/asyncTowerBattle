import { HitBox } from "../../../../shared/hitboxes";
import { Cell } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { OrangeBattleTower } from "../../battle/implementation/battle-orange-tower";
import { OrangeTower } from "../../entity/implementation/orange-tower";
import { TowerRecruit } from "../tower-recruit";
import { BattleGrid } from "../../../grid/battle-grid";
import { AnyBattleTower } from "../../battle/battle-tower";
import { Derive } from "@ddd-ts/traits";
import { TDrawable, TRenderable } from "../../../../shared/traits/drawable";
import { GridElement } from "../../../grid/grid";

export class OrangeTowerRecruit extends Derive(TowerRecruit, TDrawable, TRenderable) {
  isPatternActivated: (gridElement: GridElement | undefined) => boolean;
  patternEffect: Cell[];
  attackDamage = 10;
  attackSpeed = 3;
  type = "orange" as const;
  hitbox: HitBox;
  draw: OrangeTower["draw"];

  constructor(public tower: OrangeTower, public cell: Cell) {
    super({});
    this.hitbox = tower.hitbox;
    this.patternEffect = tower.patternEffect;
    this.draw = tower.draw;
    this.isPatternActivated = tower.isPatternActivated;
  }

  toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
    const clone = this.clone();
    const position = grid.cellToReal(clone.cell);
    return new OrangeBattleTower(clone, hooks, position, clone.cell);
  }

  toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower {
    const clone = this.clone();
    const cell = BattleGrid.flip(grid, clone.cell);
    const position = grid.cellToReal(cell);
    return new OrangeBattleTower(clone, hooks, position, cell);
  }

  clone(): OrangeTowerRecruit {
    return new OrangeTowerRecruit(
      new OrangeTower({}),
      new Cell({
        x: this.cell.x,
        y: this.cell.y,
      })
    );
  }

  get position(): Cell {
    return this.cell;
  }

  drawPriority = 3;
}
