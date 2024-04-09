import { Derive } from "@ddd-ts/traits";
import { Resources } from "../../../../renderer/resources";
import { TImageDrawable } from "../../../../shared/traits/drawable";
import { Cell, Position } from "../../../../shared/position";
import { HitBox, Rectangle, THitbox } from "../../../../shared/hitboxes";
import { WaveBarrack } from "../../recruit/implementation/wave-barrack-recruit";
import { TShopBlueprint } from "../../../../shared/traits/shop-blueprint";

export class WaveBarrackBlueprint extends Derive(
	TShopBlueprint(10, 10),
	THitbox(new HitBox([[new Rectangle({ width: 4, height: 6 }), new Position({ x: 0, y: 0 })]])),
	TImageDrawable(Resources.barracks.wave.resource.image, Resources.barracks.wave.size, 2),
) {
	productionSpeed: number = 3.5;

	toRecruit(cell: Cell) {
		return new WaveBarrack(cell.clone(),this);
	}
}
