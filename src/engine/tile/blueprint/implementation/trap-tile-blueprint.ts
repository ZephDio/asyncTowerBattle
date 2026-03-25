import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../../shared/position";
import { TrapPathTile } from "../../recruit/implementation/trap-tile";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { Description, TDescriptor } from "../../../../shared/traits/render/huds/item-descriptor";
import { PathResources } from "../../../../renderer/resources/path.resources";
import { TileTag } from "../../../../shared/traits/engine/tags/building/building-tags";

export class TrapTileBlueprint extends Derive(
	TShopBlueprint(10, 5),
	TImageDrawable(PathResources.trap.image, PathResources.trap.size, DrawPriority.CarpetStyleGridElement),
	TDescriptor,
	TileTag,
	THitbox(new HitBox([[new Rectangle({ width: 4.9, height: 4.9 }), new GridPosition({ x: 0, y: 0 })]])),
) {
	description = new Description("Trap Tile", ["A trap path", "that stun stepping", "enemies for 2 seconds"]);
	toRecruit(cell: Cell) {
		return new TrapPathTile(cell, this);
	}
}
