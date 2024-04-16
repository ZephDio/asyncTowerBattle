import { Derive } from "@ddd-ts/traits";
import { Resources } from "../../../../renderer/resources";
import { TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Cell, GridPosition } from "../../../../shared/position";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { BasicBarrack } from "../../recruit/implementation/basic-barrack-recruit";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { BarrackDescription, TDescriptor } from "../../../../shared/traits/render/huds/item-descriptor";

export class BasicBarrackBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new GridPosition({ x: 0, y: 0 })]])),
	TDescriptor,
	TImageDrawable(Resources.barracks.basic.resource.image, Resources.barracks.basic.size, 2),
) {
	productionSpeed: number = 3;

	description = new BarrackDescription("Basic Barrack", ["A barrack that spawn", "unit one by one"], {
		"production speed": "3",
	});

	toRecruit(cell: Cell) {
		return new BasicBarrack(cell.clone(), this);
	}
}
