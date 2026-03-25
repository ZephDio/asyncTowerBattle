import { implementsTrait, ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { BattlePath } from "../../path/battle/battle-path";
import { AnyBattleUnit } from "../battle/battle-unit";
import { TRecruit } from "../../../shared/traits/engine/recruit";
import { RetailGrid } from "../../grid/retail-grid";
import { ArmyGrid } from "../../grid/grid";
import { Barrack } from "../../constructs/barrack/recruit/barrack";
import { Inventory } from "../../grid/inventory/unit-inventory";
import { TokenHooks } from "../../shop/holder/holder";
import { GridPosition } from "../../../shared/position";
import { TGrid } from "../../grid/tgrid";
import { HTBaseStats } from "../../stats/base-stats";
import { HTTag } from "../../../shared/traits/engine/tags/tagged";

export type AnyUnit = ImplementsTrait<typeof Unit>;

export const Unit = Subtrait([TRecruit, HTBaseStats, HTTag], (base) => {
	abstract class IUnit extends base {
		abstract toBattle(position: GridPosition, path: BattlePath, hooks: BattleArmyHooks): AnyBattleUnit;

		moveRecruit(hooks: TokenHooks, position: GridPosition, _orientation: number, grid?: ImplementsTrait<typeof TGrid>) {
			if (!grid) throw new Error("Invalid grid");
			if (grid instanceof RetailGrid) {
				hooks.shopPhaseHooks.economyHooks.addGold(Math.round(10));
				return;
			}
			const cell = grid.gridPositionToCell(position);
			if (!cell) throw new Error("Invalid cell");
			const element = grid.getElement(cell);
			if (grid instanceof ArmyGrid) {
				if (element && implementsTrait(element, Barrack)) {
					if (element.unitRecruit) {
						hooks.shopPhaseHooks.armyHooks.pushToInventory(element.unitRecruit);
					}
					this.cell = cell.clone();
					element.setUnit(this);
					return;
				}
				throw new Error("Invalid cell");
			}
			if (grid instanceof Inventory) {
				if (element) throw new Error("already occupied cell");
				this.cell = cell.clone();
				hooks.shopPhaseHooks.armyHooks.addRecruit(this, grid);
				return undefined;
			}
			throw new Error("Invalid grid");
		}
	}
	return IUnit;
});
