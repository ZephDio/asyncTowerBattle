import { Cell, GridPosition, ScreenPosition } from "../../../../shared/position";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { THudRenderable } from "../../../../shared/traits/render/huds/hud-renderable";
import { ImplementsTrait, Subtrait } from "../../../../../traits/traits";
import { AnyRecruit } from "../../../../shared/traits/engine/recruit";
import { Buyable } from "../../retail/buyable";
import { TokenHooks } from "../holder";
import { TGrid } from "../../../grid/tgrid";
import { PatternEffect } from "../../../pattern-effect/pattern-effect";

type Holdable = Buyable | AnyRecruit;

export const TTokenDrag = Subtrait([THudRenderable, HTImageDrawable], (base, Props) => {
	abstract class ITokenDrag extends base {
		protected hooks: TokenHooks;
		public position: ScreenPosition;
		abstract holded: Holdable;
		public orientation: number;
		constructor(props: { hooks: TokenHooks; position: ScreenPosition; orientation: number } & typeof Props) {
			super(props);
			this.hooks = props.hooks;
			this.position = props.position;
			this.orientation = props.orientation;
			this.angle = this.orientation;
		}
		abstract onRelease(position?: GridPosition, grid?: ImplementsTrait<typeof TGrid>): void;
		abstract getPatternEffect(): PatternEffect | undefined;

		getProjectionCells(cell: Cell) {
			if (this.holded instanceof Buyable) {
				return this.holded.entity.gridShape.getOccupiedCellsFrom(cell, this.orientation);
			}
			return this.holded.gridShape.getOccupiedCellsFrom(cell, this.orientation);
		}

		rotate() {
			this.orientation = (this.orientation - Math.PI / 2) % (2 * Math.PI);
			this.angle = this.orientation;
		}
	}
	return ITokenDrag;
});
