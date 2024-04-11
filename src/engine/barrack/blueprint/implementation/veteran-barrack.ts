import { Derive } from "@ddd-ts/traits";
import { Resources } from "../../../../renderer/resources";
import { TImageDrawable } from "../../../../shared/traits/drawable";
import { Cell, GridPosition } from "../../../../shared/position";
import { HitBox, Rectangle, THitbox } from "../../../../shared/hitboxes";
import { TShopBlueprint } from "../../../../shared/traits/shop-blueprint";
import { VeterantBarrack } from "../../recruit/implementation/veterant-barrack-recruit";

export class VeterantBarrackBlueprint extends Derive(
	TShopBlueprint(10, 6),
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new GridPosition({ x: 0, y: 0 })]])),
	TImageDrawable(Resources.barracks.veterant.resource.image, Resources.barracks.veterant.size, 2),
) {
	productionSpeed: number = 3.5;

	toRecruit(cell: Cell) {
		return new VeterantBarrack(cell.clone(), this);
	}
}
