import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { SlowingPathTile } from "../../recruit/implementation/slowing-tile";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { STANDARD_CELL_SIZE } from "../../../grid/tgrid";
import { Description, TDescriptor } from "../../../../shared/traits/render/huds/item-descriptor";
import { PathResources } from "../../../../renderer/resources/path.resources";
import { TileTag } from "../../../../shared/traits/engine/tags/building/building-tags";

export class SlowingTileBlueprint extends Derive(
	TShopBlueprint(10, 3),
	TImageDrawable(PathResources.slowing.image, PathResources.slowing.size, DrawPriority.CarpetStyleGridElement),
	TDescriptor,
	TileTag,
	THitbox(
		new HitBox([
			[new Rectangle({ width: STANDARD_CELL_SIZE, height: STANDARD_CELL_SIZE }), new GridPosition({ x: 0, y: 0 })],
		]),
	),
) {
	description = new Description("Slowing Tile", ["A muddy path", "that slows stepping", "enemies by 30%"]);

	toRecruit(cell: Cell) {
		return new SlowingPathTile(cell, this);
	}
}
