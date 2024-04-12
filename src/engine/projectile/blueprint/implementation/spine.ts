import { Derive } from "@ddd-ts/traits";
import { Resources } from "../../../../renderer/resources";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { GridPosition } from "../../../../shared/position";
import { TImageDrawable } from "../../../../shared/traits/render/image-drawable";

export class Spine extends Derive(
	THitbox(new HitBox([[new Rectangle({ width: 2.5, height: 2.5 }), new GridPosition({ x: 0, y: 0 })]])),
	TImageDrawable(Resources.projectiles.spine.resource.image, Resources.projectiles.spine.size, 3),
) {
	constructor(public baseSpeed: number = 2.8) {
		super({});
	}
}
