import { Derive } from "@ddd-ts/traits";
import { Resources } from "../../../../renderer/resources";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { Cell, GridPosition } from "../../../../shared/position";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { WaveBarrack } from "../../recruit/implementation/wave-barrack-recruit";
import { TShopBlueprint } from "../../../../shared/traits/engine/shop-blueprint";
import { BarrackDescription, TDescriptor } from "../../../../shared/traits/render/huds/item-descriptor";
import { FoodConsumer } from "../../../../shared/traits/engine/food-consumer";

export class WaveBarrackBlueprint extends Derive(
	TShopBlueprint(10, 10),
	TDescriptor,
	FoodConsumer,
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new GridPosition({ x: 0, y: 0 })]])),
	TImageDrawable(Resources.barracks.wave.resource.image, Resources.barracks.wave.size, DrawPriority.NormalGridElement),
) {
	productionSpeed: number = 3.5;

	foodCost = 1.8;

	description = new BarrackDescription("Wave Barrack", ["A barrack that", "spawn unit 3 by 3"], {
		"production speed": "3.5",
	});

	toRecruit(cell: Cell) {
		return new WaveBarrack(cell.clone(), this);
	}
}
