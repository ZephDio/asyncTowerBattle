import { Derive } from "@ddd-ts/traits";
import { HitBox } from "../../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../../shared/hitbox/shapes/rectangle";
import { THitbox } from "../../../../shared/traits/engine/core/THitbox";
import { GridPosition } from "../../../../shared/position";
import { DrawPriority, TImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { ProjectileResources } from "../../../../renderer/resources/projectile.resources";

export class Spine extends Derive(
	THitbox(new HitBox([[new Rectangle({ width: 2.5, height: 2.5 }), new GridPosition({ x: 0, y: 0 })]])),
	TImageDrawable(ProjectileResources.spine.image, ProjectileResources.spine.size, DrawPriority.FlyingGridElement),
) {
	constructor(public baseSpeed: number = 2.8) {
		super({});
	}
}
