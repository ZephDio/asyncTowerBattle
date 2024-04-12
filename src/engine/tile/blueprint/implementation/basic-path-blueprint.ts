import { Derive } from "@ddd-ts/traits";
import { Resources } from "../../../../renderer/resources";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Cell, GridPosition } from "../../../../shared/position";
import { BasicPathTile } from "../../recruit/implementation/basic-tile";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";

export class BasicTileBlueprint extends Derive(
	TShopBlueprint(10, 10),
	TImageDrawable(Resources.path.normal.image, { width: 4.9, height: 4.9 }, 2),
	THitbox(new HitBox([[new Rectangle({ width: 4.9, height: 4.9 }), new GridPosition({ x: 0, y: 0 })]])),
) {
	toRecruit(cell: Cell) {
		return new BasicPathTile(cell, this);
	}
}
