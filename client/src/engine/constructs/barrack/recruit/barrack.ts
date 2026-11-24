import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { AnyUnit } from "../../../units/recruit/unit";
import { AnyBattleBarrack } from "../battle/battle-barrack";
import { BattleGrid } from "../../../grid/battle-grid";
import { TRecruit } from "../../../../shared/traits/engine/recruit";
import { RetailGrid } from "../../../grid/retail-grid";
import { GridPosition } from "../../../../shared/position";
import { ArmyGrid } from "../../../grid/grid";
import { Inventory } from "../../../grid/inventory/unit-inventory";
import { TokenHooks } from "../../../shop/holder/holder";
import { TGrid } from "../../../grid/tgrid";
import { RecruitCaster } from "../../../../shared/traits/engine/cast";
import { HTBaseStats } from "../../../stats/base-stats";
import { TLiveDescriptor } from "../../../../shared/traits/render/huds/item-descriptor";
import { Physic } from "../../../../shared/physic";
import { barrackLines } from "../barrack-lines";
import { TokenUnit } from "../../../../shared/traits/engine/token-unit";

export type AnyBarrack = ImplementsTrait<typeof Barrack>;

export const Barrack = Subtrait([TRecruit, RecruitCaster, HTBaseStats, TLiveDescriptor], (base) => {
	abstract class IBarrack extends base {
		abstract unitRecruit: null | AnyUnit;
		// The army's basic unit, set by the army when the barrack joins it. The barrack spawns it when it holds no unit.
		defaultUnit: ImplementsTrait<typeof TokenUnit> | null = null;

		liveLines() {
			return barrackLines(this.bondedUnit, this.stats.castSpeed, this.stats.castSpeed);
		}

		// The unit put on the barrack, if the position (in the grid's frame) is over it: it is drawn 1.8 above the
		// barrack's position (the shape's center for multi-cell barracks) and can be grabbed from there.
		unitAt(grid: ImplementsTrait<typeof TGrid>, gridPosition: GridPosition) {
			if (!this.unitRecruit) return null;
			const barrackPosition = this.position instanceof GridPosition ? this.position : grid.cellToGrid(this.cell);
			const unitPosition = new GridPosition({ x: barrackPosition.x, y: barrackPosition.y + 1.8 });
			return Physic.doCollide(unitPosition, this.unitRecruit.hitbox, gridPosition) ? this.unitRecruit : null;
		}

		get bondedUnit() {
			return this.unitRecruit ?? this.defaultUnit;
		}

		setUnit(unit: AnyUnit | null) {
			this.unitRecruit = unit;
		}

		abstract toAllied(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleBarrack;
		abstract toEnemy(grid: BattleGrid, hooks: BattleArmyHooks): AnyBattleBarrack;

		moveRecruit(hooks: TokenHooks, gridPosition: GridPosition, grid?: ImplementsTrait<typeof TGrid>) {
			if (!grid) throw new Error("Invalid grid");
			if (grid instanceof RetailGrid) {
				hooks.shopPhaseHooks.economyHooks.addGold(Math.round(10));
				if (this.unitRecruit) {
					hooks.shopPhaseHooks.armyHooks.pushToInventory(this.unitRecruit);
				}
				return;
			}
			const cell = grid.gridPositionToCell(this.gridShape.getDefaultTilePositionFromGridPosition(gridPosition));
			if (!cell) throw new Error("Invalid cell");
			if (grid instanceof ArmyGrid || grid instanceof Inventory) {
				const { valid, elements } = grid.validateGridElementPlacement(this, cell);
				if (!valid) throw new Error("Invalid condition");
				return hooks.shopPhaseHooks.armyHooks.placeOver(this, cell, grid, elements);
			}
			throw new Error("No Case Matched");
		}
	}
	return IBarrack;
});
