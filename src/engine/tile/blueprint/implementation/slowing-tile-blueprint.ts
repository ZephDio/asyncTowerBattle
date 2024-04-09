import { Derive } from "@ddd-ts/traits";
import { HitBox, Rectangle, THitbox } from "../../../../shared/hitboxes";
import { Cell, Position } from "../../../../shared/position";
import { TImageDrawable } from "../../../../shared/traits/drawable";
import { Resources } from "../../../../renderer/resources";
import { SlowingPathTile } from "../../recruit/implementation/slowing-tile";
import { TShopBlueprint } from "../../../../shared/traits/shop-blueprint";

export class SlowingTileBlueprint extends Derive(
	TShopBlueprint(10, 3),
	TImageDrawable(Resources.path.slowing.image, { width: 4.9, height: 4.9 }, 2),
	THitbox(new HitBox([[new Rectangle({ width: 4.9, height: 4.9 }), new Position({ x: 0, y: 0 })]])),
) {
	toRecruit(cell: Cell) {
		return new SlowingPathTile(cell, this);
	}
}
