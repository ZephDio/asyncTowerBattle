import { Derive, ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { TTokenDrag } from "./token-drag";
import { Cell, GridPosition, ScreenPosition } from "../../../../shared/position";
import { ArmyGrid } from "../../../grid/grid";
import { TSynergy } from "../../../../shared/traits/engine/synergy";
import { AnyRecruit, TRecruit } from "../../../../shared/traits/engine/recruit";
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
		super({ imageDrawable: holded, hooks, position, orientation: holded.orientation });
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
			const element = this.holded.moveRecruit(this.hooks, position, this.orientation, grid);
			if (!element) {
				this.hooks.holderHooks.removeHold();
				return;
			}

			if (implementsTrait(element, TRecruit)) {
				const onAbort = () => {
					this.hooks.shopPhaseHooks.armyHooks.pushToInventory(element);
					this.hooks.holderHooks.removeHold();
				};
				const token = new RecruitTokenDrag(element, this.position, this.hooks, onAbort);
				this.hooks.holderHooks.removeHold();
				this.hooks.shopPhaseHooks.armyHooks.removeRecruit(element);
				this.hooks.holderHooks.setHold(token);
				return;
			}
			throw new Error("Invalid element");
		} catch {
			this.onAbort();
		}
	}

	getPatternEffect() {
		if (implementsTrait(this.holded, TSynergy)) {
			return this.holded.patternEffect;
		}
		return undefined;
	}
}
