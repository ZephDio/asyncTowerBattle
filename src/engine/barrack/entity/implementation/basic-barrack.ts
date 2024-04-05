import { Derive } from "@ddd-ts/traits";
import { Resources } from "../../../../renderer/resources";
import { TImageDrawable } from "../../../../shared/traits/drawable";
import { Position } from "../../../../shared/position";
import { HitBox, Rectangle } from "../../../../shared/hitboxes";

export class BasicBarrack extends Derive(
	TImageDrawable(Resources.barracks.basic.resource.image, Resources.barracks.basic.size, 2),
) {
	hitbox = new HitBox([[new Rectangle({ width: 4, height: 6 }), new Position({ x: 0, y: 0 })]]);
	productionSpeed: number = 3;
}
