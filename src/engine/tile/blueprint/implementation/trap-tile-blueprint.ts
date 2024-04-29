import { Derive } from "@ddd-ts/traits";
import { Resources } from "../../../../renderer/resources";
import { Cell, GridPosition } from "../../../../shared/position";
import { TrapPathTile } from "../../recruit/implementation/trap-tile";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { Description, TDescriptor } from "../../../../shared/traits/render/huds/item-descriptor";

export class TrapTileBlueprint extends Derive(
	TShopBlueprint(10, 5),
	TImageDrawable(Resources.path.trap.image, { width: 4.9, height: 4.9 }, DrawPriority.CarpetStyleGridElement),
	TDescriptor,
	THitbox(new HitBox([[new Rectangle({ width: 4.9, height: 4.9 }), new GridPosition({ x: 0, y: 0 })]])),
) {
	description = new Description("Trap Tile", ["A trap path", "that stun stepping", "enemies for 2 seconds"]);
	toRecruit(cell: Cell) {
		return new TrapPathTile(cell, this);
	}
}
