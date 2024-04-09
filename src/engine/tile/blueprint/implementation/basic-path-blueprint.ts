import { Derive } from "@ddd-ts/traits";
import { Resources } from "../../../../renderer/resources";
import { HitBox, Rectangle, THitbox } from "../../../../shared/hitboxes";
import { TImageDrawable } from "../../../../shared/traits/drawable";
import { Cell, Position } from "../../../../shared/position";
import { BasicPathTile } from "../../recruit/implementation/basic-tile";
import { TShopBlueprint } from "../../../../shared/traits/shop-blueprint";

export class BasicTileBlueprint extends Derive(
	TShopBlueprint(10, 10),
	TImageDrawable(Resources.path.normal.image, { width: 4.9, height: 4.9 }, 2),
	THitbox(new HitBox([[new Rectangle({ width: 4.9, height: 4.9 }), new Position({ x: 0, y: 0 })]])),
) {
	toRecruit(cell: Cell) {
		return new BasicPathTile(cell, this);
	}
}
