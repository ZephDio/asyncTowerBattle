import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { Cell, GridPosition } from "../../../../shared/position";
import { TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Resources } from "../../../../renderer/resources";
import { SlowingPathTile } from "../../recruit/implementation/slowing-tile";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";

export class SlowingTileBlueprint extends Derive(
	TShopBlueprint(10, 3),
	TImageDrawable(Resources.path.slowing.image, { width: 4.9, height: 4.9 }, 2),
	THitbox(new HitBox([[new Rectangle({ width: 4.9, height: 4.9 }), new GridPosition({ x: 0, y: 0 })]])),
) {
	toRecruit(cell: Cell) {
		return new SlowingPathTile(cell, this);
	}
}
