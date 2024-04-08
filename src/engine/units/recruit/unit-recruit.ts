import { implementsTrait, ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { Position } from "../../../shared/position";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { BattlePath } from "../../path/battle/battle-path";
import { AnyBattleUnit } from "../battle/battle-unit";
import { TRecruit } from "../../../shared/traits/recruit";
import { TokenHooks } from "../../shop/shop";
import { RetailGrid } from "../../grid/retail-grid";
import { ArmyGrid } from "../../grid/grid";
import { Barrack } from "../../barrack/recruit/barrack-recruit";
import { Inventory } from "../../grid/inventory/unit-inventory";

export type AnyUnit = ImplementsTrait<typeof Unit>;

export const Unit = Subtrait([TRecruit], (base) => {
	abstract class IUnit extends base {
		abstract maxLife: number;
		abstract speed: number;
		abstract attackSpeed: number;
		abstract attackDamage: number;
		abstract cost: number;

		abstract toBattle(position: Position, path: BattlePath, hooks: BattleArmyHooks): AnyBattleUnit;

		moveRecruit(hooks: TokenHooks, position: Position) {
			const grid = hooks.shopHooks.determinateGrid(position);
			if (!grid) throw new Error("Invalid grid");
			if (grid instanceof RetailGrid) {
				hooks.economyHooks.addGold(Math.round(10));
				return
			}
			const cell = grid.realPositionToGrid(position);
			if (!cell) throw new Error("Invalid cell");
			const element = grid.getElement(cell);
			if (grid instanceof ArmyGrid) {
				if (implementsTrait(element, Barrack)) {
					if (element.unitRecruit) {
						hooks.armyHooks.pushToInventory(element.unitRecruit);
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
				hooks.armyHooks.addRecruit(this, grid);
				return;
			}
			throw new Error("Invalid grid");
		}
	}
	return IUnit;
});
