import { Derive } from "@ddd-ts/traits";
import { Resources } from "../../../../renderer/resources";
import { TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Cell, GridPosition } from "../../../../shared/position";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { VeterantBarrack } from "../../recruit/implementation/veterant-barrack-recruit";

export class VeterantBarrackBlueprint extends Derive(
	TShopBlueprint(10, 6),
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new GridPosition({ x: 0, y: 0 })]])),
	TImageDrawable(Resources.barracks.veterant.resource.image, Resources.barracks.veterant.size, 2),
) {
	productionSpeed: number = 1.6;

	toRecruit(cell: Cell) {
		return new VeterantBarrack(cell.clone(), this);
	}
}
