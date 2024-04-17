import { Derive, ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { Tower } from "../../../tower/recruit/tower-recruit";
import { TTokenDrag } from "./token-drag";
import { Cell, GridPosition, ScreenPosition } from "../../../../shared/position";
import { ArmyGrid } from "../../../grid/grid";
import { TSynergy } from "../../../../shared/traits/engine/synergy";
import { AnyRecruit } from "../../../../shared/traits/engine/recruit";
import { THudRenderable } from "../../../../shared/traits/render/huds/hud-renderable";
import { TokenHooks } from "../holder";
import { TGrid } from "../../../grid/tgrid";

export class RecruitTokenDrag extends Derive(TTokenDrag) {
	constructor(
		public holded: AnyRecruit,
		position: ScreenPosition,
		hooks: TokenHooks,
		public onAbort: () => void,
	) {
		super({ imageDrawable: holded, hooks, position });
	}

	override huds() {
		if (implementsTrait(this.holded, THudRenderable)) {
			return this.holded.huds();
		}
		return [];
	}

	isValid(cell: Cell): boolean {
		const grid = this.hooks.shopPhaseHooks.armyHooks.getArmyGrid();
		return !grid.tiles.has(ArmyGrid.posToString(cell));
	}

	onRelease(position?: GridPosition, grid?: ImplementsTrait<typeof TGrid>): void {
		try {
			if (!position) throw new Error("Invalid position");
			this.holded.moveRecruit(this.hooks, position, grid);
			this.hooks.holderHooks.removeHold();
		} catch {
			console.log("abort");
			this.onAbort();
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
