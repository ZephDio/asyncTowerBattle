import { Derive } from "@ddd-ts/traits";
import { Resources } from "../../../../renderer/resources";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Cell, GridPosition } from "../../../../shared/position";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { VeterantBarrack } from "../../recruit/implementation/veterant-barrack";
import { BarrackDescription, TDescriptor } from "../../../../shared/traits/render/huds/item-descriptor";
import { FoodConsumer } from "../../../../shared/traits/engine/food-consumer";

export class VeterantBarrackBlueprint extends Derive(
	TShopBlueprint(10, 6),
	TDescriptor,
	FoodConsumer,
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new GridPosition({ x: 0, y: 0 })]])),
	TImageDrawable(Resources.barracks.veterant.resource.image, Resources.barracks.veterant.size, DrawPriority.NormalGridElement),
) {
	productionSpeed: number = 1;

	foodCost = 5;

	description = new BarrackDescription(
		"Veterant Barrack",
		["A barrack that spawn", "a giant unit with", "reduced movement", "speed but greatly", "enhanced health", "", "Takes 1.6 times more", "time to produce unit"],
		{
			"production speed": "1",
		},
	);

	toRecruit(cell: Cell) {
		return new VeterantBarrack(cell.clone(), this);
	}
}
