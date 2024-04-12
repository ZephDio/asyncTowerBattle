import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../renderer/resources";
import { SlowingPathTile } from "../../recruit/implementation/slowing-tile";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { STANDARD_CELL_SIZE } from "../../../grid/tgrid";

export class SlowingTileBlueprint extends Derive(
	TShopBlueprint(10, 3),
	TImageDrawable(Resources.path.slowing.image, { width: STANDARD_CELL_SIZE, height: STANDARD_CELL_SIZE }, 2),
	THitbox(
		new HitBox([
			[new Rectangle({ width: STANDARD_CELL_SIZE, height: STANDARD_CELL_SIZE }), new GridPosition({ x: 0, y: 0 })],
		]),
	),
) {
	toRecruit(cell: Cell) {
		return new SlowingPathTile(cell, this);
	}
}
