import { Derive, ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { PtiWrapRanch } from "../../grid/inventory/unit-inventory";
import { TTokenDrag } from "./token-drag";
import { Cell, Position } from "../../../shared/position";
import { TokenHooks } from "../shop";
import { BarrackRecruit } from "../../barrack/recruit/barrack-recruit";
import { ArmyGrid } from "../../grid/grid";

export class UnitTokenDrag extends Derive(TTokenDrag) {
	constructor(
		public entity: PtiWrapRanch,
		position: Position,
		hooks: TokenHooks,
	) {
		super({ imageDrawable: entity, hooks, position });
	}

	isValid(cell: Cell): false | ImplementsTrait<typeof BarrackRecruit> {
		const grid = this.hooks.armyHooks.getArmyGrid();
		const recruit = grid.tiles.get(ArmyGrid.posToString(cell));
		if (recruit && implementsTrait(recruit, BarrackRecruit)) {
			return recruit;
		}
		return false;
	}

	onRelease(position?: Position): void {
		const grid = this.hooks.armyHooks.getArmyGrid();
		try {
			if (!position) throw new Error();
			const cell = grid.realPositionToGrid(position);
			if (cell) {
				const recruit = this.isValid(cell);
				if (!recruit) {
					throw new Error();
				}
				this.entity.cell.x = cell.x;
				this.entity.cell.y = cell.y;
				if (recruit.unitRecruit) {
					this.hooks.armyHooks.addUnit(recruit.unitRecruit);
				}
				recruit.setUnit(this.entity.unit);
				this.hooks.removeHold();
				return;
			}
			throw new Error();
		} catch {
			this.hooks.armyHooks.addUnit(this.entity.unit);
			this.hooks.removeHold();
		}
	}

	getSynergies() {
		return undefined;
	}
}
