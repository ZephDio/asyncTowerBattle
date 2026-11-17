import { Cell, GridPosition, ScreenPosition } from "../../../../shared/position";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { THudRenderable } from "../../../../shared/traits/render/huds/hud-renderable";
import { ImplementsTrait, Subtrait, implementsTrait } from "../../../../../traits/traits";
import { AnyRecruit } from "../../../../shared/traits/engine/recruit";
import { Buyable } from "../../retail/buyable";
import { TokenHooks } from "../holder";
import { STANDARD_CELL_SIZE, TGrid } from "../../../grid/tgrid";
import { PatternEffect } from "../../../pattern-effect/pattern-effect";
import { TargetZone } from "../../../target-zone/target-zone";
import { TTargeting } from "../../../../shared/traits/engine/targeting";
import { TImageVariant } from "../../../../shared/traits/render/image-variant";

type Holdable = Buyable | AnyRecruit;

export const TTokenDrag = Subtrait([THudRenderable, HTImageDrawable, TImageVariant], (base, Props) => {
	abstract class ITokenDrag extends base {
		protected hooks: TokenHooks;
		public position: ScreenPosition;
		abstract holded: Holdable;
		constructor(props: { hooks: TokenHooks; position: ScreenPosition } & typeof Props) {
			super(props);
			this.hooks = props.hooks;
			this.position = props.position;
		}
		abstract onRelease(position?: GridPosition, grid?: ImplementsTrait<typeof TGrid>): void;
		abstract getPatternEffect(): PatternEffect | undefined;

		getTargetZone(): TargetZone | undefined {
			const held = this.holded instanceof Buyable ? this.holded.entity : this.holded;
			return implementsTrait(held, TTargeting) ? held.targetZone : undefined;
		}

		// Draws what the held item would draw, e.g. a path tile's straight image rather than its full tile image.
		getImageVariant() {
			return implementsTrait(this.holded, TImageVariant) ? this.holded.getImageVariant() : null;
		}

		getProjectionCells(gridPosition: GridPosition) {
			if (this.holded instanceof Buyable) {
				const gridPositionForDefaultTile =
					this.holded.entity.gridShape.getDefaultTilePositionFromGridPosition(gridPosition);
				const cell = new Cell({
					x: Math.floor(gridPositionForDefaultTile.x / STANDARD_CELL_SIZE),
					y: Math.floor(gridPositionForDefaultTile.y / STANDARD_CELL_SIZE),
				});
				return this.holded.entity.gridShape.getOccupiedCellsFrom(cell);
			}
			const gridPositionForDefaultTile = this.holded.gridShape.getDefaultTilePositionFromGridPosition(gridPosition);
			const cell = new Cell({
				x: Math.floor(gridPositionForDefaultTile.x / STANDARD_CELL_SIZE),
				y: Math.floor(gridPositionForDefaultTile.y / STANDARD_CELL_SIZE),
			});
			return this.holded.gridShape.getOccupiedCellsFrom(cell);
		}
	}
	return ITokenDrag;
});
