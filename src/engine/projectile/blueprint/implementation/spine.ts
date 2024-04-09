import { Derive } from "@ddd-ts/traits";
import { Resources } from "../../../../renderer/resources";
import { HitBox, Rectangle, THitbox } from "../../../../shared/hitboxes";
import { Position } from "../../../../shared/position";
import { TImageDrawable } from "../../../../shared/traits/drawable";

export class Spine extends Derive(
	THitbox(new HitBox([[new Rectangle({ width: 2, height: 2 }), new Position({ x: 0, y: 0 })]])),
	TImageDrawable(Resources.projectiles.spine.resource.image, Resources.projectiles.spine.size, 3),
) {
	constructor(public baseSpeed: number = 2.8) {
		super({});
	}
}
