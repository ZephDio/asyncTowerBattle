import { Derive, implementsTrait } from "@ddd-ts/traits";
import { AnyTower, Tower } from "../../tower/recruit/tower-recruit";
import { TTokenDrag } from "./token-drag";
import { AnyBarrack } from "../../barrack/recruit/barrack-recruit";
import { AnyPathTile } from "../../tile/blueprint/tile";
import { TokenHooks } from "../shop";
import { Cell, Position } from "../../../shared/position";
import { ArmyGrid } from "../../grid/grid";
import { TSynergy } from "../../../shared/traits/synergy";

export class ArmyRecruitTokenDrag extends Derive(TTokenDrag) {
	constructor(
		public entity: AnyTower | AnyBarrack | AnyPathTile,
		position: Position,
		hooks: TokenHooks,
	) {
		super({ imageDrawable: entity, hooks, position });
	}

	isValid(cell: Cell): boolean {
		const grid = this.hooks.armyHooks.getArmyGrid();
		return !grid.tiles.has(ArmyGrid.posToString(cell));
	}

	onRelease(position?: Position): void {
		const grid = this.hooks.armyHooks.getArmyGrid();
		try {
			if (!position) throw new Error();
			const cell = grid.realPositionToGrid(position);
			if (cell) {
				if (!this.isValid(cell)) {
					throw new Error();
				}
				this.entity.cell.x = cell.x;
				this.entity.cell.y = cell.y;
				this.hooks.armyHooks.addRecruit(this.entity);
				this.hooks.removeHold();
				return;
			}
			throw new Error();
		} catch {
			this.hooks.armyHooks.addRecruit(this.entity);
			this.hooks.removeHold();
		}
	}

	getSynergies() {
		if (implementsTrait(this.entity, Tower)) {
			if (implementsTrait(this.entity, TSynergy)) {
				return this.entity.getSynergies();
			}
		}
		return undefined;
	}
}
