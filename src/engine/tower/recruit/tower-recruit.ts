import { HitBox } from "../../../shared/hitboxes";
import { Cell, Position } from "../../../shared/position";
import { AnyBattleTower } from "../battle/battle-tower";
import { AnyTower } from "../entity/tower";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { BattleGrid } from "../../grid/battle-grid";
import { BlueTowerRecruit } from "./implementation/blue-tower-recruit";
import { GreenTowerRecruit } from "./implementation/green-tower-recruit";
import { OrangeTowerRecruit } from "./implementation/orange-tower-recruit";
import { Trait } from "@ddd-ts/traits";

export const TowerRecruit = Trait((base) => {
  abstract class ITowerRecruit extends base {
    abstract hitbox: HitBox;
    abstract attackSpeed: number;
    abstract attackDamage: number;
    abstract patternEffect: Cell[];
    abstract cell: Cell;

    abstract toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower;
    abstract toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleTower;
    abstract clone(): ITowerRecruit;
  }
  return ITowerRecruit;
});

// export abstract class TowerRecruit<T extends AnyTower = AnyTower> implements Recruit {
//   abstract type: T["type"];
//   abstract hitbox: HitBox;
//   abstract attackSpeed: number;
//   abstract attackDamage: number;
//   abstract patternEffect: GridPosition[];
//   abstract cell: GridPosition;
//   abstract tower: T;

//   abstract toAllied(grid: BattleGrid, hooks: BattleArmyHooks): BattleTower;
//   abstract toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): BattleTower;
//   abstract clone(): TowerRecruit<T>;

//   toSerialized(grid: Grid): SerializedTowerRecruit {
//     return {
//       type: this.type,
//       cell: this.cell,
//       position: grid.cellToReal(this.cell),
//     };
//   }
// }

export type AnyTowerRecruit = BlueTowerRecruit | GreenTowerRecruit | OrangeTowerRecruit;

export interface SerializedTowerRecruit {
  type: AnyTower["type"];
  cell: Cell;
  position: Position;
}
