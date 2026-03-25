import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Cell, GridPosition } from "../../../../shared/position";
import { BasicPathTile } from "../../recruit/implementation/basic-tile";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { STANDARD_CELL_SIZE } from "../../../grid/tgrid";
import { Description, TDescriptor } from "../../../../shared/traits/render/huds/item-descriptor";
import { PathResources } from "../../../../renderer/resources/path.resources";
import { TileTag } from "../../../../shared/traits/engine/tags/building/building-tags";

export class BasicTileBlueprint extends Derive(
	TShopBlueprint(10, 10),
	TImageDrawable(PathResources.normal.image, PathResources.normal.size, DrawPriority.CarpetStyleGridElement),
	TDescriptor,
	TileTag,
	THitbox(
		new HitBox([
			[new Rectangle({ width: STANDARD_CELL_SIZE, height: STANDARD_CELL_SIZE }), new GridPosition({ x: 0, y: 0 })],
		]),
	),
) {
	description = new Description("Basic Tile", ["A simple dirt path"]);
	toRecruit(cell: Cell) {
		return new BasicPathTile(cell, this);
	}
}
