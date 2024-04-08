import { Derive } from "@ddd-ts/traits";
import { Resources } from "../../../../renderer/resources";
import { TImageDrawable } from "../../../../shared/traits/drawable";
import { Cell, Position } from "../../../../shared/position";
import { HitBox, Rectangle, THitbox } from "../../../../shared/hitboxes";
import { BasicBarrack } from "../../recruit/implementation/basic-barrack-recruit";
import { TShopBlueprint } from "../../../../shared/traits/shop-blueprint";

export class BasicBarrackBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new Position({ x: 0, y: 0 })]])),
	TImageDrawable(Resources.barracks.basic.resource.image, Resources.barracks.basic.size, 2),
) {
	productionSpeed: number = 3;

	toRecruit(cell: Cell) {
		return new BasicBarrack(cell.clone(),this);
	}
}
