import { Derive, implementsTrait } from "@ddd-ts/traits";
import { Tower } from "../../tower/recruit/tower-recruit";
import { TTokenDrag } from "./token-drag";
import { TokenHooks } from "../shop";
import { Cell, Position } from "../../../shared/position";
import { ArmyGrid } from "../../grid/grid";
import { TSynergy } from "../../../shared/traits/synergy";
import { AnyRecruit } from "../../../shared/traits/recruit";

export class RecruitTokenDrag extends Derive(TTokenDrag) {
	constructor(
		public holded: AnyRecruit,
		position: Position,
		hooks: TokenHooks,
		public onAbort: () => void,
	) {
		super({ imageDrawable: holded, hooks, position });
	}

	isValid(cell: Cell): boolean {
		const grid = this.hooks.armyHooks.getArmyGrid();
		return !grid.tiles.has(ArmyGrid.posToString(cell));
	}

	onRelease(position?: Position): void {
		try {
			if (!position) throw new Error("Invalid position");
			this.holded.moveRecruit(this.hooks, position);
			this.hooks.removeHold();
		} catch {
			this.onAbort();
			this.hooks.removeHold();
		}
	}

	getSynergies() {
		if (implementsTrait(this.holded, Tower)) {
			if (implementsTrait(this.holded, TSynergy)) {
				return this.holded.getSynergies();
			}
		}
		return undefined;
	}
}
